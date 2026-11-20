import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtPayload } from '../auth/jwt-payload.interface';

const buyer: JwtPayload = { id: 'buyer-1', role: 'acheteur' } as JwtPayload;
const vendorA: JwtPayload = {
  id: 'vendor-a',
  role: 'fournisseur',
} as JwtPayload;
const admin: JwtPayload = { id: 'admin-1', role: 'admin' } as JwtPayload;

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    commandes: Record<string, jest.Mock>;
    details_commandes: Record<string, jest.Mock>;
    boutiques: Record<string, jest.Mock>;
    factures: Record<string, jest.Mock>;
    $transaction: jest.Mock;
  };
  let tx: {
    compteurs_facture: Record<string, jest.Mock>;
    factures: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    tx = {
      compteurs_facture: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      factures: { create: jest.fn() },
    };
    prisma = {
      commandes: { findUnique: jest.fn() },
      details_commandes: { findMany: jest.fn(), count: jest.fn() },
      boutiques: { findFirst: jest.fn() },
      factures: { findUnique: jest.fn(), findMany: jest.fn() },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(InvoiceService);
  });

  describe('getOrCreateForOrder', () => {
    it("lève NotFoundException si la commande n'existe pas", async () => {
      prisma.commandes.findUnique.mockResolvedValue(null);
      await expect(
        service.getOrCreateForOrder('missing', {}, buyer),
      ).rejects.toThrow(NotFoundException);
    });

    it("lève ForbiddenException pour un acheteur qui n'est ni acheteur ni vendeur de la commande", async () => {
      prisma.commandes.findUnique.mockResolvedValue({
        id: 'o1',
        utilisateur_id: 'other-buyer',
      });
      prisma.details_commandes.count.mockResolvedValue(0);
      await expect(
        service.getOrCreateForOrder('o1', {}, buyer),
      ).rejects.toThrow(ForbiddenException);
    });

    it("lève BadRequestException si la commande n'a aucun article", async () => {
      prisma.commandes.findUnique.mockResolvedValue({
        id: 'o1',
        utilisateur_id: buyer.id,
      });
      prisma.details_commandes.findMany.mockResolvedValue([]);
      await expect(
        service.getOrCreateForOrder('o1', {}, buyer),
      ).rejects.toThrow(BadRequestException);
    });

    it('extrait correctement la TVA depuis un montant TTC (prix affichés TTC)', async () => {
      prisma.commandes.findUnique.mockResolvedValue({
        id: 'o1',
        utilisateur_id: buyer.id,
      });
      prisma.details_commandes.findMany.mockResolvedValue([
        { fournisseur_id: vendorA.id, prix_unitaire_achat: 118, quantite: 1 },
      ]);
      prisma.boutiques.findFirst.mockResolvedValue({
        id: 'store-a',
        proprietaire_id: vendorA.id,
      });
      prisma.factures.findUnique.mockResolvedValue(null);
      tx.compteurs_facture.findFirst.mockResolvedValue(null);
      tx.compteurs_facture.create.mockResolvedValue({ dernier_numero: 1 });
      tx.factures.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => data,
      );

      const [invoice] = await service.getOrCreateForOrder('o1', {}, buyer);

      expect(invoice.montant_ttc).toBe(118);
      expect(invoice.montant_ht).toBe(100);
      expect(invoice.montant_tva).toBe(18);
      expect(invoice.numero).toBe('FAC-00000001');
    });

    it("renvoie la facture existante plutôt que d'en créer une nouvelle (idempotent)", async () => {
      prisma.commandes.findUnique.mockResolvedValue({
        id: 'o1',
        utilisateur_id: buyer.id,
      });
      prisma.details_commandes.findMany.mockResolvedValue([
        { fournisseur_id: vendorA.id, prix_unitaire_achat: 118, quantite: 1 },
      ]);
      prisma.boutiques.findFirst.mockResolvedValue({
        id: 'store-a',
        proprietaire_id: vendorA.id,
      });
      const existing = { id: 'existing-invoice' };
      prisma.factures.findUnique.mockResolvedValue(existing);

      const [invoice] = await service.getOrCreateForOrder('o1', {}, buyer);

      expect(invoice).toBe(existing);
      expect(tx.factures.create).not.toHaveBeenCalled();
    });

    it("un vendeur d'une commande multi-vendeurs ne génère que sa propre facture", async () => {
      prisma.commandes.findUnique.mockResolvedValue({
        id: 'o1',
        utilisateur_id: buyer.id,
      });
      prisma.details_commandes.findMany.mockResolvedValue([
        { fournisseur_id: vendorA.id, prix_unitaire_achat: 100, quantite: 1 },
        { fournisseur_id: 'vendor-b', prix_unitaire_achat: 200, quantite: 1 },
      ]);
      prisma.details_commandes.count.mockResolvedValue(1);
      prisma.boutiques.findFirst.mockResolvedValue({
        id: 'store-a',
        proprietaire_id: vendorA.id,
      });
      prisma.factures.findUnique.mockResolvedValue(null);
      tx.compteurs_facture.findFirst.mockResolvedValue({
        id: 1,
        dernier_numero: 5,
      });
      tx.compteurs_facture.update.mockResolvedValue({ dernier_numero: 6 });
      tx.factures.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => data,
      );

      const invoices = await service.getOrCreateForOrder('o1', {}, vendorA);

      expect(invoices).toHaveLength(1);
      expect(prisma.boutiques.findFirst).toHaveBeenCalledWith({
        where: { proprietaire_id: vendorA.id },
      });
    });

    it('renvoie la facture concurrente sur violation de contrainte unique (P2002)', async () => {
      prisma.commandes.findUnique.mockResolvedValue({
        id: 'o1',
        utilisateur_id: buyer.id,
      });
      prisma.details_commandes.findMany.mockResolvedValue([
        { fournisseur_id: vendorA.id, prix_unitaire_achat: 118, quantite: 1 },
      ]);
      prisma.boutiques.findFirst.mockResolvedValue({
        id: 'store-a',
        proprietaire_id: vendorA.id,
      });
      const concurrent = { id: 'concurrent-invoice' };
      prisma.factures.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(concurrent);
      prisma.$transaction.mockImplementation(() => {
        const err = new Prisma.PrismaClientKnownRequestError(
          'unique constraint',
          {
            code: 'P2002',
            clientVersion: '0.0.0',
          },
        );
        return Promise.reject(err);
      });

      const [invoice] = await service.getOrCreateForOrder('o1', {}, buyer);

      expect(invoice).toBe(concurrent);
    });
  });

  describe('getById', () => {
    it("lève NotFoundException si la facture n'existe pas", async () => {
      prisma.factures.findUnique.mockResolvedValue(null);
      await expect(service.getById('missing', buyer)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lève ForbiddenException pour un tiers sans lien avec la commande', async () => {
      prisma.factures.findUnique.mockResolvedValue({
        id: 'f1',
        commande_id: 'o1',
        commandes: { id: 'o1', utilisateur_id: 'someone-else' },
        boutiques: { proprietaire_id: vendorA.id },
      });
      prisma.details_commandes.count.mockResolvedValue(0);
      await expect(service.getById('f1', buyer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("admin accède à n'importe quelle facture et reçoit les lignes détaillées", async () => {
      prisma.factures.findUnique.mockResolvedValue({
        id: 'f1',
        commande_id: 'o1',
        commandes: { id: 'o1', utilisateur_id: buyer.id },
        boutiques: { proprietaire_id: vendorA.id },
      });
      prisma.details_commandes.findMany.mockResolvedValue([
        {
          produits: { nom_produit: 'Sac de riz' },
          quantite: 2,
          prix_unitaire_achat: 50,
        },
      ]);

      const result = await service.getById('f1', admin);

      expect(result.lignes).toEqual([
        {
          designation: 'Sac de riz',
          quantite: 2,
          prix_unitaire_ttc: 50,
          montant_ttc: 100,
        },
      ]);
    });
  });

  describe('exportSyscohadaJournal', () => {
    it("refuse l'export à un acheteur", async () => {
      await expect(service.exportSyscohadaJournal(buyer, {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('génère un journal équilibré (débit = crédit) pour une facture avec TVA', async () => {
      prisma.boutiques.findFirst.mockResolvedValue({ id: 'store-a' });
      prisma.factures.findMany.mockResolvedValue([
        {
          numero: 'FAC-00000001',
          date_emission: new Date('2026-01-15T00:00:00.000Z'),
          montant_ht: 100,
          montant_tva: 18,
          montant_ttc: 118,
          boutiques: { nom_boutique: 'Boutique A' },
        },
      ]);

      const csv = await service.exportSyscohadaJournal(vendorA, {});
      const lines = csv.split('\r\n');

      expect(lines).toHaveLength(4);
      expect(lines[1]).toContain('411000');
      expect(lines[1]).toContain('118,00');
      expect(lines[2]).toContain('701000');
      expect(lines[2]).toContain('100,00');
      expect(lines[3]).toContain('443000');
      expect(lines[3]).toContain('18,00');
    });
  });
});
