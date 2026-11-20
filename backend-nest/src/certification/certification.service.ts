import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { ReviewCertificationDto } from './dto/review-certification.dto';

// Seuil du niveau de vérification (analyse concurrentielle #5) — basé sur le
// nombre de TYPES DISTINCTS de certification validés (pas le nombre brut de
// documents, pour éviter qu'un même type re-soumis plusieurs fois gonfle
// artificiellement le niveau). Réplique
// backend/src/certification/service/certification.service.js.
const GOLD_THRESHOLD = 3;

@Injectable()
export class CertificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly internalBridge: InternalBridgeService,
  ) {}

  create(dto: CreateCertificationDto, fournisseurId: string) {
    return this.prisma.certifications.create({
      data: {
        id: randomUUID(),
        fournisseur_id: fournisseurId,
        type: dto.type,
        document_url: dto.document_url,
        date_expiration: dto.date_expiration ? new Date(dto.date_expiration) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  getMine(fournisseurId: string) {
    return this.prisma.certifications.findMany({
      where: { fournisseur_id: fournisseurId },
      orderBy: { createdAt: 'desc' },
    });
  }

  getAll(statut?: string) {
    return this.prisma.certifications.findMany({
      where: statut ? { statut } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async review(id: string, dto: ReviewCertificationDto) {
    const certification = await this.prisma.certifications.findUnique({ where: { id } });
    if (!certification) throw new NotFoundException('Certification non trouvée.');

    const updated = await this.prisma.certifications.update({
      where: { id },
      data: { statut: dto.statut, commentaire_admin: dto.commentaire_admin ?? null, updatedAt: new Date() },
    });

    // Marque la boutique du fournisseur comme vérifiée dès qu'au moins une
    // certification est validée, et recalcule son niveau de vérification —
    // même règle que certificationService.review côté Express. Le niveau
    // est recalculé même sur un rejet (aucun impact réel ici puisqu'il ne
    // dépend que des certifications déjà validées, mais on garde le même
    // comportement que l'original). Contrairement à l'original Express (pas
    // de try/catch autour de l'écriture Store, donc une panne y ferait
    // échouer toute la requête), l'appel passe ici par le pont interne
    // best-effort : la revue reste actée même si le badge boutique met du
    // retard à se synchroniser.
    const distinctTypes = await this.countDistinctValidatedTypes(certification.fournisseur_id);
    const niveau_verification = distinctTypes >= GOLD_THRESHOLD ? 'verifie_or' : distinctTypes >= 1 ? 'verifie' : 'non_verifie';

    await this.internalBridge.updateStoreVerification(certification.fournisseur_id, {
      isVerified: dto.statut === 'validee' ? true : undefined,
      niveauVerification: niveau_verification,
    });

    return { ...updated, niveau_verification };
  }

  async getVendorStatus(vendorId: string) {
    const count = await this.prisma.certifications.count({ where: { fournisseur_id: vendorId, statut: 'validee' } });
    const distinctTypes = await this.countDistinctValidatedTypes(vendorId);
    const niveau_verification = distinctTypes >= GOLD_THRESHOLD ? 'verifie_or' : distinctTypes >= 1 ? 'verifie' : 'non_verifie';
    return { certified: count > 0, count, niveau_verification };
  }

  private async countDistinctValidatedTypes(fournisseurId: string): Promise<number> {
    const rows = await this.prisma.certifications.findMany({
      where: { fournisseur_id: fournisseurId, statut: 'validee' },
      distinct: ['type'],
      select: { type: true },
    });
    return rows.length;
  }
}
