import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertThresholdService } from './alert-threshold.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AlertThresholdService', () => {
  let service: AlertThresholdService;
  let prisma: {
    produits: Record<string, jest.Mock>;
    seuils_alerte: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      produits: { findUnique: jest.fn() },
      seuils_alerte: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertThresholdService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AlertThresholdService);
  });

  describe('createOrUpdate', () => {
    it("lève NotFoundException si le produit n'existe pas", async () => {
      prisma.produits.findUnique.mockResolvedValue(null);
      await expect(
        service.createOrUpdate('u1', {
          produit_id: 'p1',
          type: 'prix_produit',
          valeur_seuil: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("crée un nouveau seuil avec l'opérateur par défaut si omis", async () => {
      prisma.produits.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.seuils_alerte.findFirst.mockResolvedValue(null);
      prisma.seuils_alerte.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) => data,
      );

      const created = await service.createOrUpdate('u1', {
        produit_id: 'p1',
        type: 'prix_produit',
        valeur_seuil: 10,
      });

      expect(created).toMatchObject({
        utilisateur_id: 'u1',
        produit_id: 'p1',
        type: 'prix_produit',
        operateur: 'inferieur_egal',
        valeur_seuil: 10,
      });
    });

    it('met à jour le seuil existant plutôt que de créer un doublon, et le réactive', async () => {
      prisma.produits.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.seuils_alerte.findFirst.mockResolvedValue({
        id: 's1',
        actif: false,
      });
      prisma.seuils_alerte.update.mockResolvedValue({ id: 's1', actif: true });

      await service.createOrUpdate('u1', {
        produit_id: 'p1',
        type: 'stock_produit',
        operateur: 'superieur_egal',
        valeur_seuil: 5,
      });

      expect(prisma.seuils_alerte.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { operateur: 'superieur_egal', valeur_seuil: 5, actif: true },
      });
      expect(prisma.seuils_alerte.create).not.toHaveBeenCalled();
    });
  });

  describe('toggle', () => {
    it("lève NotFoundException si le seuil n'appartient pas à l'utilisateur", async () => {
      prisma.seuils_alerte.findFirst.mockResolvedValue(null);
      await expect(service.toggle('s1', 'u1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('met à jour uniquement le champ actif', async () => {
      prisma.seuils_alerte.findFirst.mockResolvedValue({ id: 's1' });
      prisma.seuils_alerte.update.mockResolvedValue({ id: 's1', actif: false });

      await service.toggle('s1', 'u1', false);

      expect(prisma.seuils_alerte.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { actif: false },
      });
    });
  });

  describe('remove', () => {
    it("lève NotFoundException si le seuil n'appartient pas à l'utilisateur", async () => {
      prisma.seuils_alerte.findFirst.mockResolvedValue(null);
      await expect(service.remove('s1', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('supprime le seuil et confirme', async () => {
      prisma.seuils_alerte.findFirst.mockResolvedValue({ id: 's1' });
      const result = await service.remove('s1', 'u1');
      expect(prisma.seuils_alerte.delete).toHaveBeenCalledWith({
        where: { id: 's1' },
      });
      expect(result).toEqual({ message: 'Seuil supprimé.' });
    });
  });
});
