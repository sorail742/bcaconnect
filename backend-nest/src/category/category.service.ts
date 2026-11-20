import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';
import { Prisma } from '../../generated/prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtPayload } from '../auth/jwt-payload.interface';

// Réplique backend/src/category/service/category.service.js — mêmes règles
// métier, portées vers Prisma + le pont interne (deletion-log, encore
// Sequelize). Toutes les contraintes FK entrantes sur categories
// (produits.categorie_id, demandes_devis.categorie_id, parent_id) sont
// ON DELETE SET NULL en base (vérifié via pg_constraint) — supprimer une
// catégorie encore utilisée réussit toujours, sans jamais lever P2003.
// L'interception ci-dessous reste une garde défensive générique sur
// l'endpoint de suppression (bonne pratique), pas une réponse à un cas
// réellement observé.
@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly internalBridge: InternalBridgeService,
  ) {}

  findAllRootWithChildren() {
    return this.prisma.categories.findMany({
      where: { parent_id: null },
      include: { sous_categories: { orderBy: { nom_categorie: 'asc' } } },
      orderBy: { nom_categorie: 'asc' },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.categories.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Catégorie non trouvée.');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.categories.create({
        data: {
          id: randomUUID(),
          nom_categorie: dto.nom_categorie,
          description: dto.description,
          image_url: dto.image_url || null,
          parent_id: dto.parent_id || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      throw this.translateUniqueConstraint(err);
    }
  }

  async update(id: string, dto: CreateCategoryDto) {
    const existing = await this.findById(id);

    try {
      return await this.prisma.categories.update({
        where: { id },
        data: {
          nom_categorie: dto.nom_categorie,
          description: dto.description,
          image_url: dto.image_url !== undefined ? dto.image_url : existing.image_url,
          parent_id: dto.parent_id !== undefined ? dto.parent_id : existing.parent_id,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      throw this.translateUniqueConstraint(err);
    }
  }

  // Express traduit SequelizeUniqueConstraintError en 400 "Valeur dupliquée"
  // (errorHandler.js) — équivalent Prisma pour nom_categorie (@unique),
  // sans quoi une création/mise à jour en doublon remonterait un 500 brut.
  private translateUniqueConstraint(err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return new ConflictException('Une catégorie porte déjà ce nom.');
    }
    return err;
  }

  async remove(id: string, user: JwtPayload, ip: string | null, userAgent: string | null, confirmationNom?: string) {
    const existing = await this.findById(id);

    // Contrairement à backend/src/category/service/category.service.js (qui
    // journalise avant de supprimer, même en cas d'échec de la suppression
    // elle-même faute de contrainte FK gérée), on ne journalise qu'après
    // succès réel — sinon une tentative bloquée par P2003 laisserait une
    // entrée d'audit mensongère ("supprimé") pour un enregistrement toujours
    // bien présent en base.
    try {
      await this.prisma.categories.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException(
          'Impossible de supprimer : des produits, sous-catégories ou demandes de devis sont encore rattachés à cette catégorie.',
        );
      }
      throw err;
    }

    await this.internalBridge.recordDeletion(
      'Category',
      { ...existing },
      {
        user: { id: user.id, nom_complet: user.nom_complet, email: user.email, role: user.role },
        ip,
        userAgent,
        confirmationNom,
      },
    );

    return { message: 'Catégorie supprimée avec succès.' };
  }
}
