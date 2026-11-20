import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProductQuestionService } from './product-question.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';
import { JwtPayload } from '../auth/jwt-payload.interface';

const buyer: JwtPayload = { id: 'buyer-1', role: 'acheteur' } as JwtPayload;
const vendor: JwtPayload = {
  id: 'vendor-1',
  role: 'fournisseur',
} as JwtPayload;
const admin: JwtPayload = { id: 'admin-1', role: 'admin' } as JwtPayload;

describe('ProductQuestionService', () => {
  let service: ProductQuestionService;
  let prisma: {
    produits: Record<string, jest.Mock>;
    questions_produits: Record<string, jest.Mock>;
  };
  let bridge: { createNotification: jest.Mock };

  beforeEach(async () => {
    prisma = {
      produits: { findUnique: jest.fn() },
      questions_produits: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    bridge = { createNotification: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductQuestionService,
        { provide: PrismaService, useValue: prisma },
        { provide: InternalBridgeService, useValue: bridge },
      ],
    }).compile();

    service = module.get(ProductQuestionService);
  });

  describe('ask', () => {
    it('rejette une question de moins de 5 caractères', async () => {
      await expect(service.ask('p1', 'Hey', buyer)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("lève NotFoundException si le produit n'existe pas", async () => {
      prisma.produits.findUnique.mockResolvedValue(null);
      await expect(
        service.ask('p1', 'Une vraie question ?', buyer),
      ).rejects.toThrow(NotFoundException);
    });

    it('notifie le vendeur propriétaire, jamais soi-même', async () => {
      prisma.produits.findUnique.mockResolvedValue({
        nom_produit: 'Sac de riz',
        boutiques: { proprietaire_id: vendor.id },
      });
      prisma.questions_produits.create.mockResolvedValue({ id: 'q1' });
      prisma.questions_produits.findUnique.mockResolvedValue({ id: 'q1' });

      await service.ask('p1', 'Ce produit est-il garanti ?', buyer);

      expect(bridge.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ utilisateur_id: vendor.id, type: 'order' }),
      );
    });

    it('ne notifie personne si le vendeur pose sa propre question sur son produit', async () => {
      prisma.produits.findUnique.mockResolvedValue({
        nom_produit: 'Sac de riz',
        boutiques: { proprietaire_id: vendor.id },
      });
      prisma.questions_produits.create.mockResolvedValue({ id: 'q1' });
      prisma.questions_produits.findUnique.mockResolvedValue({ id: 'q1' });

      await service.ask('p1', 'Ce produit est-il garanti ?', vendor);

      expect(bridge.createNotification).not.toHaveBeenCalled();
    });
  });

  describe('answer', () => {
    it('rejette une réponse vide', async () => {
      await expect(service.answer('q1', '  ', vendor)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("lève ForbiddenException si l'appelant n'est ni le fournisseur du produit ni admin", async () => {
      prisma.questions_produits.findUnique.mockResolvedValue({
        id: 'q1',
        produit_id: 'p1',
        utilisateur_id: buyer.id,
      });
      prisma.produits.findUnique.mockResolvedValue({
        boutiques: { proprietaire_id: 'other-vendor' },
      });
      await expect(service.answer('q1', 'Oui.', buyer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('admin peut répondre même sans posséder le produit', async () => {
      prisma.questions_produits.findUnique.mockResolvedValue({
        id: 'q1',
        produit_id: 'p1',
        utilisateur_id: buyer.id,
      });
      prisma.questions_produits.update.mockResolvedValue({});
      prisma.questions_produits.findUnique.mockResolvedValueOnce({
        id: 'q1',
        produit_id: 'p1',
        utilisateur_id: buyer.id,
      });

      await service.answer('q1', 'Oui, garanti 2 ans.', admin);

      expect(prisma.produits.findUnique).not.toHaveBeenCalled();
      expect(bridge.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ utilisateur_id: buyer.id }),
      );
    });
  });

  describe('markHelpful', () => {
    it("lève NotFoundException si la question n'existe pas", async () => {
      prisma.questions_produits.findUnique.mockResolvedValue(null);
      await expect(service.markHelpful('q1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('incrémente le compteur utile_count', async () => {
      prisma.questions_produits.findUnique.mockResolvedValue({
        id: 'q1',
        utile_count: 3,
      });
      prisma.questions_produits.update.mockResolvedValue({ utile_count: 4 });

      const result = await service.markHelpful('q1');

      expect(prisma.questions_produits.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: { utile_count: 4 },
      });
      expect(result).toEqual({ utile_count: 4 });
    });
  });

  describe('remove', () => {
    it("autorise l'auteur de la question à la supprimer", async () => {
      prisma.questions_produits.findUnique.mockResolvedValue({
        id: 'q1',
        produit_id: 'p1',
        utilisateur_id: buyer.id,
      });
      await service.remove('q1', buyer);
      expect(prisma.questions_produits.delete).toHaveBeenCalledWith({
        where: { id: 'q1' },
      });
    });

    it("refuse un tiers qui n'est ni auteur, ni propriétaire du produit, ni admin", async () => {
      prisma.questions_produits.findUnique.mockResolvedValue({
        id: 'q1',
        produit_id: 'p1',
        utilisateur_id: buyer.id,
      });
      prisma.produits.findUnique.mockResolvedValue({
        boutiques: { proprietaire_id: 'other-vendor' },
      });
      await expect(service.remove('q1', vendor)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getPendingForVendor', () => {
    it('filtre par boutique du vendeur via la relation produits.boutiques', async () => {
      prisma.questions_produits.findMany.mockResolvedValue([]);
      await service.getPendingForVendor(vendor.id);
      expect(prisma.questions_produits.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            reponse: null,
            produits: { boutiques: { proprietaire_id: vendor.id } },
          },
        }),
      );
    });
  });
});
