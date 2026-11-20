import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Ordres n'ayant jamais réellement abouti — exclus du volume de référence
// (un litige ou une note sur une commande annulée ne reflète pas la fiabilité).
const EXCLUDED_ITEM_STATUSES = ['annule', 'annulé'];

function scoreFromRatio(
  ratio: number,
  { invert = false }: { invert?: boolean } = {},
): number {
  const clamped = Math.min(1, Math.max(0, ratio));
  return Math.round((invert ? 1 - clamped : clamped) * 20 * 10) / 10;
}

@Injectable()
export class VendorScorecardService {
  constructor(private readonly prisma: PrismaService) {}

  // Préqualification / scorecard fournisseur (analyse concurrentielle #6) —
  // construit uniquement à partir de données transactionnelles déjà
  // collectées (litiges, avis, ancienneté, temps de réponse), pas de saisie
  // manuelle. Score /100 = somme de 5 sous-scores /20.
  async getScorecard(vendorId: string) {
    const vendor = await this.prisma.utilisateurs.findUnique({
      where: { id: vendorId },
      select: { id: true, nom_complet: true, role: true },
    });
    if (!vendor || vendor.role !== 'fournisseur')
      throw new NotFoundException('Fournisseur non trouvé.');

    const store = await this.prisma.boutiques.findFirst({
      where: { proprietaire_id: vendorId },
    });

    const distinctOrders = await this.prisma.details_commandes.findMany({
      where: {
        fournisseur_id: vendorId,
        statut: { notIn: EXCLUDED_ITEM_STATUSES },
      },
      select: { commande_id: true },
      distinct: ['commande_id'],
    });
    const orderIds = distinctOrders
      .map((r) => r.commande_id)
      .filter((id): id is string => id !== null);
    const totalOrders = orderIds.length;

    const disputedOrders =
      totalOrders > 0
        ? (
            await this.prisma.litiges.findMany({
              where: { defenseur_id: vendorId, commande_id: { in: orderIds } },
              select: { commande_id: true },
              distinct: ['commande_id'],
            })
          ).length
        : 0;

    const reviewAgg = await this.prisma.reviews.aggregate({
      _avg: { note: true },
      _count: { _all: true },
      where: { produits: { boutique_id: store?.id ?? null } },
    });
    const noteMoyenne =
      reviewAgg._avg.note !== null
        ? Math.round(reviewAgg._avg.note * 10) / 10
        : null;
    const nombreAvis = reviewAgg._count._all;

    const ancienneteJours = store?.createdAt
      ? Math.floor(
          (Date.now() - store.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

    // ── Sous-scores /20 ──────────────────────────────────────────
    const scoreVolume = scoreFromRatio(Math.min(totalOrders / 50, 1)); // plafonné à 50 commandes = score max
    const scoreLitiges =
      totalOrders > 0
        ? scoreFromRatio(disputedOrders / totalOrders, { invert: true })
        : 10; // neutre si aucune donnée
    const scoreAvis =
      noteMoyenne !== null ? scoreFromRatio(noteMoyenne / 5) : 10;
    const scoreAnciennete = scoreFromRatio(Math.min(ancienneteJours / 365, 1)); // plafonné à 1 an
    const tempsReponseMinutes = store?.temps_reponse ?? null;
    const scoreReactivite =
      tempsReponseMinutes !== null
        ? scoreFromRatio(
            1 - Math.min(Number(tempsReponseMinutes) / (24 * 60), 1),
          ) // 24h = score min
        : 10;

    const scoreTotal =
      Math.round(
        (scoreVolume +
          scoreLitiges +
          scoreAvis +
          scoreAnciennete +
          scoreReactivite) *
          10,
      ) / 10;

    let niveau: string;
    if (totalOrders < 3) niveau = 'donnees_insuffisantes';
    else if (scoreTotal >= 75) niveau = 'excellent';
    else if (scoreTotal >= 50) niveau = 'fiable';
    else niveau = 'a_surveiller';

    return {
      fournisseur: { id: vendor.id, nom: vendor.nom_complet },
      niveau,
      score_total: scoreTotal,
      details: {
        volume: {
          valeur: totalOrders,
          score: scoreVolume,
          label: 'Commandes complétées',
        },
        litiges: {
          valeur:
            totalOrders > 0
              ? Math.round((disputedOrders / totalOrders) * 1000) / 10
              : null,
          score: scoreLitiges,
          label: 'Taux de litige (%)',
        },
        avis: {
          valeur: noteMoyenne,
          score: scoreAvis,
          label: 'Note moyenne (/5)',
          echantillon: nombreAvis,
        },
        anciennete: {
          valeur: ancienneteJours,
          score: scoreAnciennete,
          label: 'Ancienneté (jours)',
        },
        reactivite: {
          valeur: tempsReponseMinutes,
          score: scoreReactivite,
          label: 'Temps de réponse (min)',
        },
      },
    };
  }
}
