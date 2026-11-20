import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/jwt-payload.interface';

const admin: JwtPayload = { id: 'admin-1', role: 'admin' } as JwtPayload;
const vendor: JwtPayload = {
  id: 'vendor-1',
  role: 'fournisseur',
} as JwtPayload;
const buyer: JwtPayload = { id: 'buyer-1', role: 'acheteur' } as JwtPayload;

describe('CouponService', () => {
  let service: CouponService;
  let prisma: {
    boutiques: Record<string, jest.Mock>;
    coupons: Record<string, jest.Mock>;
    coupon_usages: Record<string, jest.Mock>;
    produits: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      boutiques: { findFirst: jest.fn() },
      coupons: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      coupon_usages: {
        count: jest.fn(),
        aggregate: jest.fn(),
        findMany: jest.fn(),
      },
      produits: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CouponService);
  });

  describe('create', () => {
    it('rejette une réduction en pourcentage hors [1, 100]', async () => {
      await expect(
        service.create({ code: 'X', type: 'percentage', valeur: 150 }, vendor),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejette un montant fixe négatif ou nul', async () => {
      await expect(
        service.create({ code: 'X', type: 'fixed', valeur: 0 }, vendor),
      ).rejects.toThrow(BadRequestException);
    });

    it("lève NotFoundException si le fournisseur n'a pas de boutique", async () => {
      prisma.boutiques.findFirst.mockResolvedValue(null);
      await expect(
        service.create({ code: 'X', type: 'fixed', valeur: 10 }, vendor),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejette un code déjà existant', async () => {
      prisma.boutiques.findFirst.mockResolvedValue({ id: 'store-1' });
      prisma.coupons.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ code: 'PROMO10', type: 'fixed', valeur: 10 }, vendor),
      ).rejects.toThrow(BadRequestException);
    });

    it('normalise le code en majuscules et scope au fournisseur', async () => {
      prisma.boutiques.findFirst.mockResolvedValue({ id: 'store-1' });
      prisma.coupons.findUnique.mockResolvedValue(null);
      prisma.coupons.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => data,
      );

      const created = await service.create(
        { code: '  promo10  ', type: 'fixed', valeur: 10 },
        vendor,
      );

      expect(created).toMatchObject({
        code: 'PROMO10',
        boutique_id: 'store-1',
        createur_id: vendor.id,
      });
    });

    it("un coupon admin n'est rattaché à aucune boutique", async () => {
      prisma.coupons.findUnique.mockResolvedValue(null);
      prisma.coupons.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => data,
      );

      const created = await service.create(
        { code: 'GLOBAL', type: 'fixed', valeur: 5 },
        admin,
      );

      expect(created).toMatchObject({ boutique_id: null });
      expect(prisma.boutiques.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('toggleActive', () => {
    it("refuse un tiers qui n'est ni admin ni créateur", async () => {
      prisma.coupons.findUnique.mockResolvedValue({
        id: 'c1',
        createur_id: vendor.id,
        actif: true,
      });
      await expect(service.toggleActive('c1', buyer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('inverse le statut actif', async () => {
      prisma.coupons.findUnique.mockResolvedValue({
        id: 'c1',
        createur_id: vendor.id,
        actif: true,
      });
      prisma.coupons.update.mockResolvedValue({ id: 'c1', actif: false });

      const result = await service.toggleActive('c1', vendor);

      expect(prisma.coupons.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { actif: false },
      });
      expect(result.message).toBe('Code promo désactivé.');
    });
  });

  describe('validateCart', () => {
    const items = [{ produit_id: 'p1', quantite: 2 }];

    it('rejette un code inconnu ou inactif', async () => {
      prisma.produits.findMany.mockResolvedValue([
        { id: 'p1', boutique_id: 'store-1', prix_unitaire: 100 },
      ]);
      prisma.coupons.findUnique.mockResolvedValue(null);
      await expect(
        service.validateCart({ code: 'NOPE', items }, buyer),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejette un coupon expiré', async () => {
      prisma.produits.findMany.mockResolvedValue([
        { id: 'p1', boutique_id: 'store-1', prix_unitaire: 100 },
      ]);
      prisma.coupons.findUnique.mockResolvedValue({
        id: 'c1',
        actif: true,
        date_debut: null,
        date_fin: new Date('2020-01-01'),
        usage_max: null,
        usage_max_par_utilisateur: 1,
        boutique_id: null,
        montant_min: null,
      });
      await expect(
        service.validateCart({ code: 'OLD', items }, buyer),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejette si l'utilisateur a déjà atteint sa limite d'usage personnelle", async () => {
      prisma.produits.findMany.mockResolvedValue([
        { id: 'p1', boutique_id: 'store-1', prix_unitaire: 100 },
      ]);
      prisma.coupons.findUnique.mockResolvedValue({
        id: 'c1',
        actif: true,
        date_debut: null,
        date_fin: null,
        usage_max: null,
        usage_max_par_utilisateur: 1,
        boutique_id: null,
        montant_min: null,
      });
      prisma.coupon_usages.count.mockResolvedValue(1);
      await expect(
        service.validateCart({ code: 'ONCE', items }, buyer),
      ).rejects.toThrow(BadRequestException);
    });

    it('ne réduit que les articles de la boutique ciblée par un coupon boutique', async () => {
      prisma.produits.findMany.mockResolvedValue([
        { id: 'p1', boutique_id: 'store-A', prix_unitaire: 100 },
        { id: 'p2', boutique_id: 'store-B', prix_unitaire: 50 },
      ]);
      prisma.coupons.findUnique.mockResolvedValue({
        id: 'c1',
        actif: true,
        date_debut: null,
        date_fin: null,
        usage_max: null,
        usage_max_par_utilisateur: 5,
        boutique_id: 'store-A',
        montant_min: null,
        type: 'percentage',
        valeur: 10,
        code: 'STOREA10',
      });
      prisma.coupon_usages.count.mockResolvedValue(0);

      const result = await service.validateCart(
        {
          code: 'storea10',
          items: [
            { produit_id: 'p1', quantite: 1 },
            { produit_id: 'p2', quantite: 1 },
          ],
        },
        buyer,
      );

      // Seul p1 (store-A, 100) qualifie -> 10% de 100 = 10, jamais 15% des 150 combinés.
      expect(result.discount).toBe(10);
    });

    it('plafonne la réduction au sous-total qualifiant (jamais négatif)', async () => {
      prisma.produits.findMany.mockResolvedValue([
        { id: 'p1', boutique_id: 'store-1', prix_unitaire: 20 },
      ]);
      prisma.coupons.findUnique.mockResolvedValue({
        id: 'c1',
        actif: true,
        date_debut: null,
        date_fin: null,
        usage_max: null,
        usage_max_par_utilisateur: 5,
        boutique_id: null,
        montant_min: null,
        type: 'fixed',
        valeur: 500,
        code: 'BIG500',
      });
      prisma.coupon_usages.count.mockResolvedValue(0);

      const result = await service.validateCart(
        { code: 'BIG500', items: [{ produit_id: 'p1', quantite: 1 }] },
        buyer,
      );

      expect(result.discount).toBe(20);
    });
  });
});
