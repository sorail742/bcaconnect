import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';
import { CreateWebinarDto } from './dto/create-webinar.dto';
import { UpdateWebinarDto } from './dto/update-webinar.dto';
import { JwtPayload } from '../auth/jwt-payload.interface';

// Réplique backend/src/webinar/service/webinar.service.js — mêmes règles
// métier, mêmes effets de bord (diffusion "en direct", journal de
// suppression), portés vers Prisma + le pont interne.
@Injectable()
export class WebinarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly internalBridge: InternalBridgeService,
  ) {}

  findAll() {
    return this.prisma.webinaires.findMany({ orderBy: { date_heure: 'asc' } });
  }

  async findById(id: string) {
    const webinar = await this.prisma.webinaires.findUnique({ where: { id } });
    if (!webinar) throw new NotFoundException('Webinaire introuvable.');
    return webinar;
  }

  create(dto: CreateWebinarDto) {
    return this.prisma.webinaires.create({
      data: {
        id: randomUUID(),
        titre: dto.titre,
        description: dto.description,
        date_heure: new Date(dto.date_heure),
        intervenant: dto.intervenant,
        categorie: dto.categorie,
        lien_rejoindre: dto.lien_rejoindre,
        video_url: dto.video_url,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async update(id: string, dto: UpdateWebinarDto) {
    const existing = await this.prisma.webinaires.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Webinaire introuvable.');

    const wasLive = existing.statut === 'en_direct';

    const updated = await this.prisma.webinaires.update({
      where: { id },
      data: {
        ...(dto.titre !== undefined && { titre: dto.titre }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date_heure !== undefined && { date_heure: new Date(dto.date_heure) }),
        ...(dto.intervenant !== undefined && { intervenant: dto.intervenant }),
        ...(dto.categorie !== undefined && { categorie: dto.categorie }),
        ...(dto.lien_rejoindre !== undefined && { lien_rejoindre: dto.lien_rejoindre }),
        ...(dto.video_url !== undefined && { video_url: dto.video_url }),
        ...(dto.statut !== undefined && { statut: dto.statut }),
        ...(dto.participants_count !== undefined && { participants_count: dto.participants_count }),
        updated_at: new Date(),
      },
    });

    // Même déclencheur que côté Express : uniquement sur la transition
    // vers "en_direct", pas à chaque mise à jour pendant que c'est déjà live.
    if (!wasLive && dto.statut === 'en_direct') {
      await this.internalBridge.emit('webinar_go_live', {
        id: updated.id,
        titre: updated.titre,
        intervenant: updated.intervenant,
        lien_rejoindre: updated.lien_rejoindre,
      });
    }

    return updated;
  }

  async remove(id: string, user: JwtPayload, ip: string | null, userAgent: string | null, confirmationNom?: string) {
    const existing = await this.prisma.webinaires.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Webinaire introuvable.');

    await this.internalBridge.recordDeletion(
      'Webinar',
      { ...existing, id: existing.id },
      {
        user: { id: user.id, nom_complet: user.nom_complet, email: user.email, role: user.role },
        ip,
        userAgent,
        confirmationNom,
      },
    );
    await this.prisma.webinaires.delete({ where: { id } });
    return { message: 'Webinaire supprimé avec succès.' };
  }
}
