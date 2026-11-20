import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CertificationService } from './certification.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';

describe('CertificationService', () => {
  let service: CertificationService;
  let prisma: { certifications: Record<string, jest.Mock> };
  let bridge: { updateStoreVerification: jest.Mock };

  beforeEach(async () => {
    prisma = {
      certifications: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };
    bridge = { updateStoreVerification: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: InternalBridgeService, useValue: bridge },
      ],
    }).compile();

    service = module.get(CertificationService);
  });

  it('create associe la certification au fournisseur authentifié', async () => {
    prisma.certifications.create.mockResolvedValue({ id: 'c1' });
    await service.create({ type: 'Registre de commerce', document_url: 'https://x.test/doc.pdf' } as any, 'u1');

    expect(prisma.certifications.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ fournisseur_id: 'u1', type: 'Registre de commerce' }),
    });
  });

  it('getMine filtre par fournisseur', async () => {
    prisma.certifications.findMany.mockResolvedValue([]);
    await service.getMine('u1');
    expect(prisma.certifications.findMany).toHaveBeenCalledWith({
      where: { fournisseur_id: 'u1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('review lève NotFoundException si la certification n\'existe pas', async () => {
    prisma.certifications.findUnique.mockResolvedValue(null);
    await expect(service.review('missing', { statut: 'validee' } as any)).rejects.toThrow(NotFoundException);
    expect(bridge.updateStoreVerification).not.toHaveBeenCalled();
  });

  it('review validée : marque la boutique vérifiée avec le niveau recalculé', async () => {
    prisma.certifications.findUnique.mockResolvedValue({ id: 'c1', fournisseur_id: 'f1' });
    prisma.certifications.update.mockResolvedValue({ id: 'c1', statut: 'validee' });
    prisma.certifications.findMany.mockResolvedValue([{ type: 'Registre de commerce' }]);

    const result = await service.review('c1', { statut: 'validee' } as any);

    expect(bridge.updateStoreVerification).toHaveBeenCalledWith('f1', { isVerified: true, niveauVerification: 'verifie' });
    expect(result.niveau_verification).toBe('verifie');
  });

  it('review rejetée : ne marque pas la boutique vérifiée mais recalcule quand même le niveau', async () => {
    prisma.certifications.findUnique.mockResolvedValue({ id: 'c1', fournisseur_id: 'f1' });
    prisma.certifications.update.mockResolvedValue({ id: 'c1', statut: 'rejetee' });
    prisma.certifications.findMany.mockResolvedValue([]);

    await service.review('c1', { statut: 'rejetee' } as any);

    expect(bridge.updateStoreVerification).toHaveBeenCalledWith('f1', { isVerified: undefined, niveauVerification: 'non_verifie' });
  });

  it('review avec 3 types distincts validés atteint le niveau or', async () => {
    prisma.certifications.findUnique.mockResolvedValue({ id: 'c1', fournisseur_id: 'f1' });
    prisma.certifications.update.mockResolvedValue({ id: 'c1', statut: 'validee' });
    prisma.certifications.findMany.mockResolvedValue([{ type: 'A' }, { type: 'B' }, { type: 'C' }]);

    const result = await service.review('c1', { statut: 'validee' } as any);

    expect(result.niveau_verification).toBe('verifie_or');
  });

  it('getVendorStatus renvoie certified=false sans certification validée', async () => {
    prisma.certifications.count.mockResolvedValue(0);
    prisma.certifications.findMany.mockResolvedValue([]);

    const result = await service.getVendorStatus('f1');

    expect(result).toEqual({ certified: false, count: 0, niveau_verification: 'non_verifie' });
  });

});
