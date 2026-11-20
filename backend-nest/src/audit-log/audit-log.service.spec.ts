import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: { audit_logs: Record<string, jest.Mock> };

  beforeEach(async () => {
    prisma = {
      audit_logs: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AuditLogService);
  });

  describe('getAll', () => {
    it('applique la pagination par défaut (page 1, limite 30)', async () => {
      prisma.audit_logs.count.mockResolvedValue(0);
      prisma.audit_logs.findMany.mockResolvedValue([]);

      const result = await service.getAll({});

      expect(prisma.audit_logs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 30, skip: 0 }),
      );
      expect(result).toEqual({ total: 0, pages: 0, currentPage: 1, logs: [] });
    });

    it('retombe sur les valeurs par défaut pour une pagination non numérique', async () => {
      prisma.audit_logs.count.mockResolvedValue(0);
      prisma.audit_logs.findMany.mockResolvedValue([]);

      await service.getAll({ page: 'abc', limit: 'xyz' });

      expect(prisma.audit_logs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 30, skip: 0 }),
      );
    });

    it('plafonne la limite à 100', async () => {
      prisma.audit_logs.count.mockResolvedValue(0);
      prisma.audit_logs.findMany.mockResolvedValue([]);

      await service.getAll({ limit: '500' });

      expect(prisma.audit_logs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('construit une recherche OR sur action/table_affectee/description', async () => {
      prisma.audit_logs.count.mockResolvedValue(0);
      prisma.audit_logs.findMany.mockResolvedValue([]);

      await service.getAll({ search: 'login' });

      expect(prisma.audit_logs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { action: { contains: 'login', mode: 'insensitive' } },
              { table_affectee: { contains: 'login', mode: 'insensitive' } },
              { description: { contains: 'login', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it("trie par ordre ancien->récent quand sort='ancien'", async () => {
      prisma.audit_logs.count.mockResolvedValue(0);
      prisma.audit_logs.findMany.mockResolvedValue([]);

      await service.getAll({ sort: 'ancien' });

      expect(prisma.audit_logs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
      );
    });
  });

  describe('getById', () => {
    it("lève NotFoundException si l'entrée n'existe pas", async () => {
      prisma.audit_logs.findUnique.mockResolvedValue(null);
      await expect(service.getById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('renvoie le log avec son auteur', async () => {
      const log = {
        id: 'l1',
        action: 'login',
        utilisateurs: { nom_complet: 'X' },
      };
      prisma.audit_logs.findUnique.mockResolvedValue(log);
      await expect(service.getById('l1')).resolves.toBe(log);
    });
  });

  describe('getUserActivitySummary', () => {
    it('agrège les IP distinctes et compte par table_affectee, y compris null', async () => {
      prisma.audit_logs.findMany.mockResolvedValue([
        { adresse_ip: '1.1.1.1', table_affectee: 'produits' },
        { adresse_ip: '1.1.1.1', table_affectee: 'produits' },
        { adresse_ip: '2.2.2.2', table_affectee: null },
      ]);

      const result = await service.getUserActivitySummary('u1');

      expect(result.total_actions_30j).toBe(3);
      expect(result.adresses_ip_distinctes).toEqual(['1.1.1.1', '2.2.2.2']);
      expect(result.repartition_par_ressource).toEqual({
        produits: 2,
        null: 1,
      });
      expect(result.derniere_action).toEqual({
        adresse_ip: '1.1.1.1',
        table_affectee: 'produits',
      });
    });

    it("renvoie derniere_action à null quand l'historique est vide", async () => {
      prisma.audit_logs.findMany.mockResolvedValue([]);
      const result = await service.getUserActivitySummary('u1');
      expect(result.derniere_action).toBeNull();
      expect(result.total_actions_30j).toBe(0);
    });
  });
});
