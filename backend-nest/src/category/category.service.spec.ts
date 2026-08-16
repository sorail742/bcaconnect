import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';
import { Prisma } from '../../generated/prisma/client';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: { categories: Record<string, jest.Mock> };
  let bridge: { emit: jest.Mock; recordDeletion: jest.Mock };

  beforeEach(async () => {
    prisma = {
      categories: {
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
        CategoryService,
        { provide: PrismaService, useValue: prisma },
        { provide: InternalBridgeService, useValue: bridge },
      ],
    }).compile();

    service = module.get(CategoryService);
  });

  it('findAllRootWithChildren ne demande que les catégories racines, avec leurs enfants triés', async () => {
    prisma.categories.findMany.mockResolvedValue([]);
    await service.findAllRootWithChildren();

    expect(prisma.categories.findMany).toHaveBeenCalledWith({
      where: { parent_id: null },
      include: { sous_categories: { orderBy: { nom_categorie: 'asc' } } },
      orderBy: { nom_categorie: 'asc' },
    });
  });

  it('findById lève NotFoundException si la catégorie n\'existe pas', async () => {
    prisma.categories.findUnique.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
  });

  it('update conserve image_url/parent_id existants si non fournis', async () => {
    prisma.categories.findUnique.mockResolvedValue({ id: 'c1', image_url: 'https://old.png', parent_id: 'root-1' });
    prisma.categories.update.mockResolvedValue({ id: 'c1' });

    await service.update('c1', { nom_categorie: 'Nouveau nom' } as any);

    expect(prisma.categories.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: expect.objectContaining({
        nom_categorie: 'Nouveau nom',
        image_url: 'https://old.png',
        parent_id: 'root-1',
      }),
    });
  });

  it('remove journalise après suppression réussie', async () => {
    prisma.categories.findUnique.mockResolvedValue({ id: 'c1', nom_categorie: 'À supprimer' });
    prisma.categories.delete.mockResolvedValue({ id: 'c1' });

    const user = { id: 'u1', email: 'admin@bca.gn', role: 'admin', nom_complet: 'Admin' } as any;
    const result = await service.remove('c1', user, '127.0.0.1', 'jest', 'À supprimer');

    expect(prisma.categories.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    expect(bridge.recordDeletion).toHaveBeenCalledWith(
      'Category',
      expect.objectContaining({ id: 'c1' }),
      expect.objectContaining({ confirmationNom: 'À supprimer' }),
    );
    expect(result).toEqual({ message: 'Catégorie supprimée avec succès.' });
  });

  it('create convertit un nom en doublon (P2002) en 409', async () => {
    prisma.categories.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.9.1',
      }),
    );
    await expect(service.create({ nom_categorie: 'Doublon' } as any)).rejects.toThrow(ConflictException);
  });

  it('remove convertit une violation de contrainte FK (P2003) en 409, sans journaliser', async () => {
    prisma.categories.findUnique.mockResolvedValue({ id: 'c1', nom_categorie: 'Encore utilisée' });
    prisma.categories.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('violates foreign key constraint', {
        code: 'P2003',
        clientVersion: '7.9.1',
      }),
    );

    const user = { id: 'u1', email: 'admin@bca.gn', role: 'admin', nom_complet: 'Admin' } as any;
    await expect(service.remove('c1', user, null, null)).rejects.toThrow(ConflictException);
    expect(bridge.recordDeletion).not.toHaveBeenCalled();
  });
});
