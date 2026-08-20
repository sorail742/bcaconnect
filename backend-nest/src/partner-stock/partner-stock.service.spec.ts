import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PartnerStockService } from './partner-stock.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/jwt-payload.interface';

describe('PartnerStockService', () => {
  let service: PartnerStockService;
  let prisma: { produits: Record<string, jest.Mock>; stocks_partenaires: Record<string, jest.Mock> };

  const fournisseur = { id: 'f1', role: 'fournisseur' } as JwtPayload;
  const admin = { id: 'admin-1', role: 'admin' } as JwtPayload;
  const autreFournisseur = { id: 'f2', role: 'fournisseur' } as JwtPayload;

  beforeEach(async () => {
    prisma = {
      produits: { findUnique: jest.fn() },
      stocks_partenaires: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnerStockService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PartnerStockService);
  });

  const produitDeF1 = { id: 'p1', stock_quantite: 10, boutiques: { proprietaire_id: 'f1' } };

  describe('assertOwnsProduct (via listByProduct)', () => {
    it('lève NotFoundException si le produit n\'existe pas', async () => {
      prisma.produits.findUnique.mockResolvedValue(null);
      await expect(service.listByProduct('missing', fournisseur)).rejects.toThrow(NotFoundException);
    });

    it('lève ForbiddenException si le produit appartient à un autre fournisseur', async () => {
      prisma.produits.findUnique.mockResolvedValue(produitDeF1);
      await expect(service.listByProduct('p1', autreFournisseur)).rejects.toThrow(ForbiddenException);
    });

    it('autorise le propriétaire du produit', async () => {
      prisma.produits.findUnique.mockResolvedValue(produitDeF1);
      prisma.stocks_partenaires.findMany.mockResolvedValue([]);
      await expect(service.listByProduct('p1', fournisseur)).resolves.toEqual([]);
    });

    it('autorise toujours un admin, même sans lien avec la boutique', async () => {
      prisma.produits.findUnique.mockResolvedValue(produitDeF1);
      prisma.stocks_partenaires.findMany.mockResolvedValue([]);
      await expect(service.listByProduct('p1', admin)).resolves.toEqual([]);
    });
  });

  describe('create', () => {
    it('applique les valeurs par défaut (type_stock, quantite)', async () => {
      prisma.produits.findUnique.mockResolvedValue(produitDeF1);
      prisma.stocks_partenaires.create.mockResolvedValue({ id: 's1' });

      await service.create('p1', { partenaire_nom: 'Fournisseur X' } as any, fournisseur);

      expect(prisma.stocks_partenaires.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          produit_id: 'p1',
          partenaire_nom: 'Fournisseur X',
          type_stock: 'entrepot_tiers',
          quantite: 0,
        }),
      });
    });
  });

  describe('update', () => {
    it('lève NotFoundException si l\'entrée n\'existe pas', async () => {
      prisma.stocks_partenaires.findUnique.mockResolvedValue(null);
      await expect(service.update('missing', {} as any, fournisseur)).rejects.toThrow(NotFoundException);
    });

    it('vérifie la propriété du produit lié avant de modifier', async () => {
      prisma.stocks_partenaires.findUnique.mockResolvedValue({ id: 's1', produit_id: 'p1' });
      prisma.produits.findUnique.mockResolvedValue(produitDeF1);
      await expect(service.update('s1', {} as any, autreFournisseur)).rejects.toThrow(ForbiddenException);
      expect(prisma.stocks_partenaires.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('vérifie la propriété avant suppression', async () => {
      prisma.stocks_partenaires.findUnique.mockResolvedValue({ id: 's1', produit_id: 'p1' });
      prisma.produits.findUnique.mockResolvedValue(produitDeF1);
      const result = await service.remove('s1', fournisseur);
      expect(prisma.stocks_partenaires.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
      expect(result).toEqual({ message: 'Entrée de stock partenaire supprimée.' });
    });
  });

  describe('getTotalStock', () => {
    it('additionne le stock propre et le stock des partenaires', async () => {
      prisma.produits.findUnique.mockResolvedValue(produitDeF1);
      prisma.stocks_partenaires.findMany.mockResolvedValue([{ quantite: 5 }, { quantite: 3 }]);

      const result = await service.getTotalStock('p1', fournisseur);

      expect(result).toEqual({
        stock_propre: 10,
        stock_partenaires: 8,
        stock_total: 18,
        detail: [{ quantite: 5 }, { quantite: 3 }],
      });
    });
  });
});
