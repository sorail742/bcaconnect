import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EducationService } from './education.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';

describe('EducationService', () => {
  let service: EducationService;
  let prisma: {
    educational_resources: Record<string, jest.Mock>;
    educational_quizzes: Record<string, jest.Mock>;
    educational_progress: Record<string, jest.Mock>;
  };
  let bridge: { emit: jest.Mock; recordDeletion: jest.Mock };

  beforeEach(async () => {
    prisma = {
      educational_resources: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      educational_quizzes: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      educational_progress: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    };
    bridge = { emit: jest.fn().mockResolvedValue(undefined), recordDeletion: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EducationService,
        { provide: PrismaService, useValue: prisma },
        { provide: InternalBridgeService, useValue: bridge },
      ],
    }).compile();

    service = module.get(EducationService);
  });

  describe('getAllResources — filtrage par audience', () => {
    it('un client ne voit que les ressources "tous" ou "clients"', async () => {
      prisma.educational_resources.findMany.mockResolvedValue([]);
      prisma.educational_progress.findMany.mockResolvedValue([]);
      await service.getAllResources({ id: 'u1', role: 'client' } as any);

      expect(prisma.educational_resources.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { audience_cible: { in: ['tous', 'clients'] } } }),
      );
    });

    it('un admin voit tout, sans filtre', async () => {
      prisma.educational_resources.findMany.mockResolvedValue([]);
      prisma.educational_progress.findMany.mockResolvedValue([]);
      await service.getAllResources({ id: 'u1', role: 'admin' } as any);

      expect(prisma.educational_resources.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
    });

    it('un invité (pas de user, optionalAuth) voit tout aussi, sans filtre — comportement Express reproduit', async () => {
      prisma.educational_resources.findMany.mockResolvedValue([]);
      await service.getAllResources(undefined);

      expect(prisma.educational_resources.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
      expect(prisma.educational_progress.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getQuizForLearner', () => {
    it('retire correct_index avant de renvoyer les questions', async () => {
      prisma.educational_quizzes.findUnique.mockResolvedValue({
        id: 'q1',
        passing_score: 70,
        questions: [{ question: 'Q1', options: ['a', 'b'], correct_index: 1 }],
      });

      const result = await service.getQuizForLearner('r1');
      expect(result.questions[0]).toEqual({ question: 'Q1', options: ['a', 'b'] });
      expect((result.questions[0] as any).correct_index).toBeUndefined();
    });

    it('lève NotFoundException si aucun quiz', async () => {
      prisma.educational_quizzes.findUnique.mockResolvedValue(null);
      await expect(service.getQuizForLearner('r1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitQuiz', () => {
    const quiz = {
      id: 'q1',
      passing_score: 60,
      questions: [
        { question: 'Q1', options: ['a', 'b'], correct_index: 0 },
        { question: 'Q2', options: ['a', 'b'], correct_index: 1 },
      ],
    };

    beforeEach(() => {
      prisma.educational_resources.findUnique.mockResolvedValue({ id: 'r1' });
      prisma.educational_quizzes.findUnique.mockResolvedValue(quiz);
    });

    it('calcule le score et marque quiz_reussi si >= passing_score', async () => {
      prisma.educational_progress.findUnique.mockResolvedValue(null);
      prisma.educational_progress.create.mockResolvedValue({ id: 'p1', tentatives: 0 });
      prisma.educational_progress.update.mockImplementation(({ data }) => Promise.resolve({ id: 'p1', ...data }));

      const result = await service.submitQuiz('r1', [0, 1], 'u1');

      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(prisma.educational_progress.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ statut: 'quiz_reussi', quiz_score: 100 }) }),
      );
    });

    it('marque quiz_echoue si en dessous du seuil, et incrémente tentatives', async () => {
      prisma.educational_progress.findUnique.mockResolvedValue({ id: 'p1', tentatives: 2 });
      prisma.educational_progress.update.mockImplementation(({ data }) => Promise.resolve({ id: 'p1', ...data }));

      const result = await service.submitQuiz('r1', [1, 0], 'u1');

      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
      expect(prisma.educational_progress.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ statut: 'quiz_echoue', tentatives: 3 }) }),
      );
    });

    it('rejette si le nombre de réponses ne correspond pas au nombre de questions', async () => {
      await expect(service.submitQuiz('r1', [0], 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('upsertQuiz — validation métier (correct_index)', () => {
    beforeEach(() => {
      prisma.educational_resources.findUnique.mockResolvedValue({ id: 'r1' });
    });

    it('rejette un correct_index hors bornes des options', async () => {
      prisma.educational_quizzes.findUnique.mockResolvedValue(null);
      await expect(
        service.upsertQuiz('r1', { questions: [{ question: 'Q', options: ['a', 'b'], correct_index: 5 }] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepte un correct_index valide et crée le quiz si absent', async () => {
      prisma.educational_quizzes.findUnique.mockResolvedValue(null);
      prisma.educational_quizzes.create.mockResolvedValue({ id: 'quiz1' });

      await service.upsertQuiz('r1', { questions: [{ question: 'Q', options: ['a', 'b'], correct_index: 1 }] } as any);
      expect(prisma.educational_quizzes.create).toHaveBeenCalled();
    });

    it('met à jour le quiz existant plutôt que d\'en recréer un (contrainte resource_id unique)', async () => {
      prisma.educational_quizzes.findUnique.mockResolvedValue({ id: 'quiz1' });
      prisma.educational_quizzes.update.mockResolvedValue({ id: 'quiz1' });

      await service.upsertQuiz('r1', { questions: [{ question: 'Q', options: ['a', 'b'], correct_index: 0 }] } as any);
      expect(prisma.educational_quizzes.update).toHaveBeenCalled();
      expect(prisma.educational_quizzes.create).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('journalise après suppression réussie', async () => {
      prisma.educational_resources.findUnique.mockResolvedValue({ id: 'r1', titre: 'À supprimer' });
      prisma.educational_resources.delete.mockResolvedValue({ id: 'r1' });

      const user = { id: 'u1', email: 'admin@bca.gn', role: 'admin', nom_complet: 'Admin' } as any;
      const result = await service.remove('r1', user, '127.0.0.1', 'jest');

      expect(prisma.educational_resources.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
      expect(bridge.recordDeletion).toHaveBeenCalledWith('EducationalResource', expect.objectContaining({ id: 'r1' }), expect.any(Object));
      expect(result).toEqual({ message: 'Ressource supprimée.' });
    });
  });
});
