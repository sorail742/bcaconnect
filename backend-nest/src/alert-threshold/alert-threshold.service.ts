import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertThresholdDto } from './dto/create-alert-threshold.dto';

const PRODUIT_SELECT = {
  id: true,
  nom_produit: true,
  prix_unitaire: true,
  stock_quantite: true,
};

@Injectable()
export class AlertThresholdService {
  constructor(private readonly prisma: PrismaService) {}

  listMine(userId: string) {
    return this.prisma.seuils_alerte.findMany({
      where: { utilisateur_id: userId },
      include: { produits: { select: PRODUIT_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Crée le seuil, ou met à jour celui déjà existant pour ce couple
  // (utilisateur, produit, type) — évite les doublons silencieux.
  async createOrUpdate(userId: string, dto: CreateAlertThresholdDto) {
    const product = await this.prisma.produits.findUnique({
      where: { id: dto.produit_id },
    });
    if (!product) throw new NotFoundException('Produit non trouvé.');

    const operateur = dto.operateur ?? 'inferieur_egal';

    const existing = await this.prisma.seuils_alerte.findFirst({
      where: {
        utilisateur_id: userId,
        produit_id: dto.produit_id,
        type: dto.type,
      },
    });

    if (existing) {
      return this.prisma.seuils_alerte.update({
        where: { id: existing.id },
        data: { operateur, valeur_seuil: dto.valeur_seuil, actif: true },
      });
    }

    return this.prisma.seuils_alerte.create({
      data: {
        id: randomUUID(),
        utilisateur_id: userId,
        produit_id: dto.produit_id,
        type: dto.type,
        operateur,
        valeur_seuil: dto.valeur_seuil,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async toggle(id: string, userId: string, actif: boolean) {
    const seuil = await this.prisma.seuils_alerte.findFirst({
      where: { id, utilisateur_id: userId },
    });
    if (!seuil) throw new NotFoundException('Seuil non trouvé.');
    return this.prisma.seuils_alerte.update({
      where: { id: seuil.id },
      data: { actif },
    });
  }

  async remove(id: string, userId: string) {
    const seuil = await this.prisma.seuils_alerte.findFirst({
      where: { id, utilisateur_id: userId },
    });
    if (!seuil) throw new NotFoundException('Seuil non trouvé.');
    await this.prisma.seuils_alerte.delete({ where: { id: seuil.id } });
    return { message: 'Seuil supprimé.' };
  }
}
