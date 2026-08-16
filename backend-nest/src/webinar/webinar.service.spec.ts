import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebinarService } from './webinar.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';

describe('WebinarService', () => {
  let service: WebinarService;
  let prisma: { webinaires: Record<string, jest.Mock> };
  let bridge: { emit: jest.Mock; recordDeletion: jest.Mock };

  beforeEach(async () => {
    prisma = {
      webinaires: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    bridge = { emit: jest.fn().mockResolvedValue(undefined), recordDeletion: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebinarService,
        { provide: PrismaService, useValue: prisma },
        { provide: InternalBridgeService, useValue: bridge },
      ],
    }).compile();

    service = module.get(WebinarService);
  });

  it('findById lève NotFoundException si le webinaire n\'existe pas', async () => {
    prisma.webinaires.findUnique.mockResolvedValue(null);
    await expect(service.findById('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('déclenche webinar_go_live uniquement sur la transition vers en_direct', async () => {
    prisma.webinaires.findUnique.mockResolvedValue({ id: 'w1', statut: 'a_venir' });
    prisma.webinaires.update.mockResolvedValue({ id: 'w1', titre: 'Test', intervenant: 'X', lien_rejoindre: 'https://x', statut: 'en_direct' });

    await service.update('w1', { statut: 'en_direct' });

    expect(bridge.emit).toHaveBeenCalledWith('webinar_go_live', {
      id: 'w1',
      titre: 'Test',
      intervenant: 'X',
      lien_rejoindre: 'https://x',
    });
  });

  it('ne redéclenche pas webinar_go_live si déjà en_direct', async () => {
    prisma.webinaires.findUnique.mockResolvedValue({ id: 'w1', statut: 'en_direct' });
    prisma.webinaires.update.mockResolvedValue({ id: 'w1', statut: 'en_direct' });

    await service.update('w1', { titre: 'Nouveau titre' });

    expect(bridge.emit).not.toHaveBeenCalled();
  });

  it('remove journalise la suppression via le pont interne avant de supprimer', async () => {
    prisma.webinaires.findUnique.mockResolvedValue({ id: 'w1', titre: 'À supprimer' });
    prisma.webinaires.delete.mockResolvedValue({ id: 'w1' });

    const user = { id: 'u1', email: 'admin@bca.gn', role: 'admin', nom_complet: 'Admin' } as any;
    const result = await service.remove('w1', user, '127.0.0.1', 'jest');

    expect(bridge.recordDeletion).toHaveBeenCalledWith(
      'Webinar',
      expect.objectContaining({ id: 'w1', titre: 'À supprimer' }),
      expect.objectContaining({ user: expect.objectContaining({ id: 'u1' }), ip: '127.0.0.1', userAgent: 'jest' }),
    );
    expect(prisma.webinaires.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
    expect(result).toEqual({ message: 'Webinaire supprimé avec succès.' });
  });

  it('remove lève NotFoundException sans appeler le pont interne si le webinaire n\'existe pas', async () => {
    prisma.webinaires.findUnique.mockResolvedValue(null);
    const user = { id: 'u1', email: 'admin@bca.gn', role: 'admin', nom_complet: 'Admin' } as any;

    await expect(service.remove('missing', user, null, null)).rejects.toThrow(NotFoundException);
    expect(bridge.recordDeletion).not.toHaveBeenCalled();
  });
});
