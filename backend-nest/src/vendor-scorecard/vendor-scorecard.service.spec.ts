import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VendorScorecardService } from './vendor-scorecard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VendorScorecardService', () => {
  let service: VendorScorecardService;
  let prisma: {
    utilisateurs: Record<string, jest.Mock>;
    boutiques: Record<string, jest.Mock>;
    details_commandes: Record<string, jest.Mock>;
    litiges: Record<string, jest.Mock>;
    reviews: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      utilisateurs: { findUnique: jest.fn() },
      boutiques: { findFirst: jest.fn() },
      details_commandes: { findMany: jest.fn() },
      litiges: { findMany: jest.fn() },
      reviews: { aggregate: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorScorecardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(VendorScorecardService);
  });

  it("lève NotFoundException si l'utilisateur n'existe pas", async () => {
    prisma.utilisateurs.findUnique.mockResolvedValue(null);
    await expect(service.getScorecard('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it("lève NotFoundException si l'utilisateur n'est pas fournisseur", async () => {
    prisma.utilisateurs.findUnique.mockResolvedValue({
      id: 'u1',
      nom_complet: 'X',
      role: 'client',
    });
    await expect(service.getScorecard('u1')).rejects.toThrow(NotFoundException);
  });

  it("renvoie 'donnees_insuffisantes' sous 3 commandes, sans aucune donnée annexe", async () => {
    prisma.utilisateurs.findUnique.mockResolvedValue({
      id: 'v1',
      nom_complet: 'Vendeur A',
      role: 'fournisseur',
    });
    prisma.boutiques.findFirst.mockResolvedValue(null);
    prisma.details_commandes.findMany.mockResolvedValue([]);
    prisma.reviews.aggregate.mockResolvedValue({
      _avg: { note: null },
      _count: { _all: 0 },
    });

    const result = await service.getScorecard('v1');

    expect(result.niveau).toBe('donnees_insuffisantes');
    expect(result.details.volume.valeur).toBe(0);
    expect(result.details.litiges.valeur).toBeNull();
    expect(result.details.avis.valeur).toBeNull();
    expect(prisma.litiges.findMany).not.toHaveBeenCalled();
  });

  it('calcule un score élevé pour un vendeur avec un bon historique et sans litige', async () => {
    prisma.utilisateurs.findUnique.mockResolvedValue({
      id: 'v1',
      nom_complet: 'Vendeur A',
      role: 'fournisseur',
    });
    prisma.boutiques.findFirst.mockResolvedValue({
      id: 'store-1',
      createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
      temps_reponse: '0',
    });
    prisma.details_commandes.findMany.mockResolvedValue(
      Array.from({ length: 60 }, (_, i) => ({ commande_id: `order-${i}` })),
    );
    prisma.litiges.findMany.mockResolvedValue([]);
    prisma.reviews.aggregate.mockResolvedValue({
      _avg: { note: 5 },
      _count: { _all: 12 },
    });

    const result = await service.getScorecard('v1');

    expect(result.niveau).toBe('excellent');
    expect(result.score_total).toBe(100);
    expect(result.details.volume.score).toBe(20);
    expect(result.details.litiges.valeur).toBe(0);
    expect(result.details.avis.valeur).toBe(5);
    expect(result.details.avis.echantillon).toBe(12);
  });

  it('un vendeur avec un fort taux de litige obtient un sous-score litiges faible', async () => {
    prisma.utilisateurs.findUnique.mockResolvedValue({
      id: 'v1',
      nom_complet: 'Vendeur A',
      role: 'fournisseur',
    });
    prisma.boutiques.findFirst.mockResolvedValue({
      id: 'store-1',
      createdAt: new Date(),
      temps_reponse: null,
    });
    prisma.details_commandes.findMany.mockResolvedValue([
      { commande_id: 'o1' },
      { commande_id: 'o2' },
      { commande_id: 'o3' },
      { commande_id: 'o4' },
    ]);
    prisma.litiges.findMany.mockResolvedValue([
      { commande_id: 'o1' },
      { commande_id: 'o2' },
    ]);
    prisma.reviews.aggregate.mockResolvedValue({
      _avg: { note: null },
      _count: { _all: 0 },
    });

    const result = await service.getScorecard('v1');

    expect(result.details.litiges.valeur).toBe(50);
    expect(result.details.litiges.score).toBe(10); // scoreFromRatio(0.5, invert) = (1-0.5)*20 = 10
  });

  it('reproduit fidèlement le NaN existant quand temps_reponse est une chaîne non numérique', async () => {
    prisma.utilisateurs.findUnique.mockResolvedValue({
      id: 'v1',
      nom_complet: 'Vendeur A',
      role: 'fournisseur',
    });
    prisma.boutiques.findFirst.mockResolvedValue({
      id: 'store-1',
      createdAt: new Date(),
      temps_reponse: '< 2h',
    });
    prisma.details_commandes.findMany.mockResolvedValue([]);
    prisma.reviews.aggregate.mockResolvedValue({
      _avg: { note: null },
      _count: { _all: 0 },
    });

    const result = await service.getScorecard('v1');

    expect(result.details.reactivite.score).toBeNaN();
  });

  it('interroge les avis via une jointure sur la boutique du vendeur', async () => {
    prisma.utilisateurs.findUnique.mockResolvedValue({
      id: 'v1',
      nom_complet: 'Vendeur A',
      role: 'fournisseur',
    });
    prisma.boutiques.findFirst.mockResolvedValue({
      id: 'store-42',
      createdAt: new Date(),
      temps_reponse: null,
    });
    prisma.details_commandes.findMany.mockResolvedValue([]);
    prisma.reviews.aggregate.mockResolvedValue({
      _avg: { note: null },
      _count: { _all: 0 },
    });

    await service.getScorecard('v1');

    expect(prisma.reviews.aggregate).toHaveBeenCalledWith({
      _avg: { note: true },
      _count: { _all: true },
      where: { produits: { boutique_id: 'store-42' } },
    });
  });
});
