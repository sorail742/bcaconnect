import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, factures } from '../../generated/prisma/client';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { CreateFromOrderDto } from './dto/create-from-order.dto';

// Prix affichés sur BCA Connect = TTC (pratique commerciale courante en
// Guinée) — la TVA est donc extraite du total, jamais ajoutée par-dessus.
// Réplique backend/src/invoice/service/invoice.service.js.
const TVA_RATE = 18.0;
const round2 = (n: number) => Math.round(n * 100) / 100;

// Plan Comptable OHADA (SYSCOHADA Révisé 2017) — comptes standards utilisés
// pour le journal des ventes, indépendants de tout logiciel particulier.
const COMPTE_CLIENTS = '411000';
const COMPTE_VENTES = '701000';
const COMPTE_TVA_FACTUREE = '443000';

const csvEscape = (v: string) => `"${v.replace(/"/g, '""')}"`;
const csvAmount = (n: unknown) => (Number(n) || 0).toFixed(2).replace('.', ',');
const csvDate = (d: Date) => d.toISOString().slice(0, 10);

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCanAccessOrder(
    order: { id: string; utilisateur_id: string | null },
    user: JwtPayload,
  ) {
    if (user.role === 'admin') return;
    if (order.utilisateur_id === user.id) return;
    const vendorItems = await this.prisma.details_commandes.count({
      where: { commande_id: order.id, fournisseur_id: user.id },
    });
    if (vendorItems > 0) return;
    throw new ForbiddenException('Non autorisé à accéder à cette facture.');
  }

  // Contrairement à l'original Sequelize (SELECT ... FOR UPDATE explicite),
  // un simple UPDATE ... SET x = x + 1 suffit : Postgres sérialise nativement
  // les écritures concurrentes sur une même ligne, donc l'incrémentation est
  // déjà atomique sans verrou explicite. La lecture initiale ne sert qu'à
  // distinguer le cas "ligne pas encore créée" (même course cold-start que
  // l'original, qui ne verrouille pas non plus une ligne qui n'existe pas).
  private async nextInvoiceNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const existing = await tx.compteurs_facture.findFirst();
    const counter = existing
      ? await tx.compteurs_facture.update({
          where: { id: existing.id },
          data: { dernier_numero: { increment: 1 } },
        })
      : await tx.compteurs_facture.create({ data: { dernier_numero: 1 } });
    return `FAC-${String(counter.dernier_numero).padStart(8, '0')}`;
  }

  // Émet (ou renvoie, idempotent) une facture par vendeur présent dans la
  // commande — jamais une facture unique "commande" quand plusieurs vendeurs
  // sont impliqués.
  async getOrCreateForOrder(
    orderId: string,
    dto: CreateFromOrderDto,
    user: JwtPayload,
  ) {
    const order = await this.prisma.commandes.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Commande non trouvée.');
    await this.assertCanAccessOrder(order, user);

    const items = await this.prisma.details_commandes.findMany({
      where: { commande_id: orderId },
    });
    if (items.length === 0)
      throw new BadRequestException(
        'Commande sans article — impossible de facturer.',
      );

    const allVendorIds = [
      ...new Set(
        items
          .map((it) => it.fournisseur_id)
          .filter((v): v is string => v !== null),
      ),
    ];
    // Un vendeur qui appelle cette route ne doit générer/voir que SA propre
    // facture — jamais celles des autres vendeurs d'une commande
    // multi-vendeurs. L'acheteur et l'admin reçoivent une facture par
    // vendeur impliqué.
    const vendorIds =
      user.role !== 'admin' && allVendorIds.includes(user.id)
        ? [user.id]
        : allVendorIds;

    const invoices: factures[] = [];
    for (const vendorId of vendorIds) {
      const store = await this.prisma.boutiques.findFirst({
        where: { proprietaire_id: vendorId },
      });
      if (!store) continue; // vendeur sans boutique — ne devrait pas arriver, on ignore plutôt que de faire échouer toute la demande

      const alreadyIssued = await this.prisma.factures.findUnique({
        where: {
          commande_id_boutique_id: {
            commande_id: orderId,
            boutique_id: store.id,
          },
        },
      });
      if (alreadyIssued) {
        invoices.push(alreadyIssued);
        continue;
      }

      const vendorItems = items.filter((it) => it.fournisseur_id === vendorId);
      const montantTtc = round2(
        vendorItems.reduce(
          (sum, it) => sum + Number(it.prix_unitaire_achat) * it.quantite,
          0,
        ),
      );
      const montantHt = round2(montantTtc / (1 + TVA_RATE / 100));
      const montantTva = round2(montantTtc - montantHt);

      try {
        const invoice = await this.prisma.$transaction(async (tx) => {
          const numero = await this.nextInvoiceNumber(tx);
          return tx.factures.create({
            data: {
              id: randomUUID(),
              numero,
              commande_id: orderId,
              boutique_id: store.id,
              // Une commande sans acheteur identifié ne devrait jamais
              // exister (checkout exige une session) — même hypothèse que
              // l'original (Invoice.utilisateur_id est NOT NULL côté Sequelize).
              utilisateur_id: order.utilisateur_id as string,
              acheteur_nif: dto.acheteur_nif?.trim() || null,
              montant_ht: montantHt,
              taux_tva: TVA_RATE,
              montant_tva: montantTva,
              montant_ttc: montantTtc,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        });
        invoices.push(invoice);
      } catch (err) {
        // Contrainte unique (commande_id, boutique_id) violée = une requête
        // concurrente a déjà créé cette facture — la renvoyer plutôt que de
        // faire échouer l'appelant.
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          const concurrent = await this.prisma.factures.findUnique({
            where: {
              commande_id_boutique_id: {
                commande_id: orderId,
                boutique_id: store.id,
              },
            },
          });
          if (concurrent) {
            invoices.push(concurrent);
            continue;
          }
        }
        throw err;
      }
    }

    return invoices;
  }

  async getById(id: string, user: JwtPayload) {
    const invoice = await this.prisma.factures.findUnique({
      where: { id },
      include: {
        commandes: true,
        boutiques: true,
        utilisateurs: { select: { id: true, nom_complet: true, email: true } },
      },
    });
    if (!invoice) throw new NotFoundException('Facture non trouvée.');
    await this.assertCanAccessOrder(invoice.commandes, user);

    // Désignation détaillée des biens (mention CGI obligatoire) — dérivée
    // des articles du vendeur de cette facture, jamais stockée en double :
    // les lignes de commande sont immuables une fois la commande passée,
    // donc ce calcul redonne exactement ce qui a été facturé au moment de
    // l'émission.
    const lignes = await this.prisma.details_commandes.findMany({
      where: {
        commande_id: invoice.commande_id,
        fournisseur_id: invoice.boutiques.proprietaire_id,
      },
      include: { produits: { select: { nom_produit: true } } },
    });

    return {
      ...invoice,
      lignes: lignes.map((l) => ({
        designation: l.produits?.nom_produit ?? 'Article',
        quantite: l.quantite,
        prix_unitaire_ttc: Number(l.prix_unitaire_achat),
        montant_ttc: round2(Number(l.prix_unitaire_achat) * l.quantite),
      })),
    };
  }

  listMine(userId: string) {
    return this.prisma.factures.findMany({
      where: { utilisateur_id: userId },
      include: { boutiques: { select: { id: true, nom_boutique: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForVendor(vendorId: string) {
    const store = await this.prisma.boutiques.findFirst({
      where: { proprietaire_id: vendorId },
    });
    if (!store) return [];
    return this.prisma.factures.findMany({
      where: { boutique_id: store.id },
      include: { utilisateurs: { select: { id: true, nom_complet: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Journal des ventes au format SYSCOHADA Révisé 2017 (analyse
  // concurrentielle #9) — export générique (CSV, plan comptable OHADA
  // standard). Un vendeur n'exporte que ses propres factures ; l'admin peut
  // exporter l'ensemble de la plateforme.
  async exportSyscohadaJournal(
    user: JwtPayload,
    query: { debut?: string; fin?: string },
  ) {
    if (user.role !== 'admin' && user.role !== 'fournisseur') {
      throw new ForbiddenException(
        'Export comptable réservé aux vendeurs et administrateurs.',
      );
    }

    const where: Prisma.facturesWhereInput = {};
    if (query.debut || query.fin) {
      where.date_emission = {};
      if (query.debut) where.date_emission.gte = new Date(query.debut);
      if (query.fin)
        where.date_emission.lte = new Date(`${query.fin}T23:59:59.999Z`);
    }

    if (user.role !== 'admin') {
      const store = await this.prisma.boutiques.findFirst({
        where: { proprietaire_id: user.id },
      });
      if (!store) return this.buildCsv([]);
      where.boutique_id = store.id;
    }

    const invoices = await this.prisma.factures.findMany({
      where,
      include: { boutiques: { select: { nom_boutique: true } } },
      orderBy: { numero: 'asc' },
    });

    return this.buildCsv(invoices);
  }

  private buildCsv(
    invoices: Array<{
      date_emission: Date;
      numero: string;
      montant_ttc: unknown;
      montant_ht: unknown;
      montant_tva: unknown;
      boutiques: { nom_boutique: string } | null;
    }>,
  ): string {
    const header = ['Date', 'N° Pièce', 'Compte', 'Libellé', 'Débit', 'Crédit'];
    const rows: string[][] = [header];

    for (const inv of invoices) {
      const date = csvDate(inv.date_emission);
      const libelleVente =
        `Vente ${inv.boutiques?.nom_boutique || ''} — ${inv.numero}`.trim();
      rows.push([
        date,
        inv.numero,
        COMPTE_CLIENTS,
        libelleVente,
        csvAmount(inv.montant_ttc),
        csvAmount(0),
      ]);
      rows.push([
        date,
        inv.numero,
        COMPTE_VENTES,
        libelleVente,
        csvAmount(0),
        csvAmount(inv.montant_ht),
      ]);
      if (Number(inv.montant_tva) > 0) {
        rows.push([
          date,
          inv.numero,
          COMPTE_TVA_FACTUREE,
          `TVA ${inv.numero}`,
          csvAmount(0),
          csvAmount(inv.montant_tva),
        ]);
      }
    }

    return rows.map((row) => row.map(csvEscape).join(';')).join('\r\n');
  }
}
