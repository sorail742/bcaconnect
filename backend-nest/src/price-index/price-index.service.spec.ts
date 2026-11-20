import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PriceIndexService } from './price-index.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PriceIndexService', () => {
  let service: PriceIndexService;
  let prisma: {
    categories: Record<string, jest.Mock>;
    produits: Record<string, jest.Mock>;
    details_commandes: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      categories: { findUnique: jest.fn() },
      produits: { findUnique: jest.fn() },
      details_commandes: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceIndexService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PriceIndexService);
  });

  describe('getByCategory', () => {
    it('lève NotFoundException si la catégorie n\'existe pas', async () => {
      prisma.categories.findUnique.mockResolvedValue(null);
      await expect(service.getByCategory('missing', 6)).rejects.toThrow(NotFoundException);
      expect(prisma.details_commandes.findMany).not.toHaveBeenCalled();
    });

    it('filtre par catégorie, statut de commande exclu et fenêtre temporelle', async () => {
      prisma.categories.findUnique.mockResolvedValue({ id: 'cat-1', nom_categorie: 'Électronique' });
      prisma.details_commandes.findMany.mockResolvedValue([]);

      await service.getByCategory('cat-1', 3);

      expect(prisma.details_commandes.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: { gte: expect.any(Date) },
          produits: { categorie_id: 'cat-1' },
          commandes: { statut: { notIn: ['annulé', 'en_attente_paiement'] } },
        },
        select: { prix_unitaire_achat: true, quantite: true, createdAt: true },
      });
    });

    it('regroupe par mois, calcule un prix moyen pondéré et une variation en %', async () => {
      prisma.categories.findUnique.mockResolvedValue({ id: 'cat-1', nom_categorie: 'Électronique' });
      prisma.details_commandes.findMany.mockResolvedValue([
        { prix_unitaire_achat: '100.00', quantite: 2, createdAt: new Date('2026-06-15') },
        { prix_unitaire_achat: '200.00', quantite: 1, createdAt: new Date('2026-06-20') },
        { prix_unitaire_achat: '150.00', quantite: 1, createdAt: new Date('2026-07-05') },
      ]);

      const result = await service.getByCategory('cat-1', 6);

      expect(result.categorie).toEqual({ id: 'cat-1', nom: 'Électronique' });
      expect(result.echantillon_total).toBe(3);
      expect(result.points).toEqual([
        { periode: '2026-06', prix_moyen: 133.33, volume_unites: 3, nombre_commandes: 2, variation_pct: null },
        { periode: '2026-07', prix_moyen: 150, volume_unites: 1, nombre_commandes: 1, variation_pct: 12.5 },
      ]);
    });
  });

  describe('getByProduct', () => {
    it('lève NotFoundException si le produit n\'existe pas', async () => {
      prisma.produits.findUnique.mockResolvedValue(null);
      await expect(service.getByProduct('missing', 6)).rejects.toThrow(NotFoundException);
      expect(prisma.details_commandes.findMany).not.toHaveBeenCalled();
    });

    it('filtre par produit et statut de commande exclu', async () => {
      prisma.produits.findUnique.mockResolvedValue({ id: 'p1', nom_produit: 'Casque audio' });
      prisma.details_commandes.findMany.mockResolvedValue([]);

      const result = await service.getByProduct('p1', 6);

      expect(prisma.details_commandes.findMany).toHaveBeenCalledWith({
        where: {
          produit_id: 'p1',
          createdAt: { gte: expect.any(Date) },
          commandes: { statut: { notIn: ['annulé', 'en_attente_paiement'] } },
        },
        select: { prix_unitaire_achat: true, quantite: true, createdAt: true },
      });
      expect(result.produit).toEqual({ id: 'p1', nom: 'Casque audio' });
      expect(result.points).toEqual([]);
      expect(result.echantillon_total).toBe(0);
    });
  });
});
