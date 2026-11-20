import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';
import { JwtPayload } from '../auth/jwt-payload.interface';

const AUTEUR_SELECT = { id: true, nom_complet: true };
const INCLUDE_AUTEUR_REPONDANT = {
  auteur: { select: AUTEUR_SELECT },
  repondant: { select: AUTEUR_SELECT },
};

@Injectable()
export class ProductQuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly internalBridge: InternalBridgeService,
  ) {}

  private async isProductOwner(
    produitId: string,
    userId: string,
  ): Promise<boolean> {
    const product = await this.prisma.produits.findUnique({
      where: { id: produitId },
      select: { boutiques: { select: { proprietaire_id: true } } },
    });
    return product?.boutiques?.proprietaire_id === userId;
  }

  // Liste publique des questions visibles pour un produit
  getForProduct(productId: string) {
    return this.prisma.questions_produits.findMany({
      where: { produit_id: productId, visible: true },
      include: INCLUDE_AUTEUR_REPONDANT,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Poser une question (tout utilisateur connecté)
  async ask(productId: string, question: string, user: JwtPayload) {
    if (!question?.trim() || question.trim().length < 5) {
      throw new BadRequestException(
        'La question doit contenir au moins 5 caractères.',
      );
    }

    const product = await this.prisma.produits.findUnique({
      where: { id: productId },
      select: {
        nom_produit: true,
        boutiques: { select: { proprietaire_id: true } },
      },
    });
    if (!product) throw new NotFoundException('Produit introuvable.');

    const created = await this.prisma.questions_produits.create({
      data: {
        id: randomUUID(),
        produit_id: productId,
        utilisateur_id: user.id,
        question: question.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const vendorId = product.boutiques?.proprietaire_id;
    if (vendorId && vendorId !== user.id) {
      await this.internalBridge.createNotification({
        utilisateur_id: vendorId,
        titre: 'Nouvelle question produit',
        message: `Un client a posé une question sur <span class="font-black text-primary">"${product.nom_produit}"</span>.`,
        type: 'order',
      });
    }

    return this.prisma.questions_produits.findUnique({
      where: { id: created.id },
      include: INCLUDE_AUTEUR_REPONDANT,
    });
  }

  // Répondre (fournisseur propriétaire du produit, ou admin)
  async answer(id: string, reponse: string, user: JwtPayload) {
    if (!reponse?.trim())
      throw new BadRequestException('La réponse ne peut pas être vide.');

    const question = await this.prisma.questions_produits.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Question introuvable.');

    const isAdmin = user.role === 'admin';
    const isOwner =
      isAdmin || (await this.isProductOwner(question.produit_id, user.id));
    if (!isOwner)
      throw new ForbiddenException(
        'Seul le fournisseur de ce produit peut répondre.',
      );

    await this.prisma.questions_produits.update({
      where: { id },
      data: {
        reponse: reponse.trim(),
        repondu_par: user.id,
        repondu_at: new Date(),
      },
    });

    if (question.utilisateur_id !== user.id) {
      await this.internalBridge.createNotification({
        utilisateur_id: question.utilisateur_id,
        titre: 'Votre question a reçu une réponse',
        message: 'Le fournisseur a répondu à votre question produit.',
        type: 'order',
      });
    }

    return this.prisma.questions_produits.findUnique({
      where: { id },
      include: INCLUDE_AUTEUR_REPONDANT,
    });
  }

  // Marquer une question comme utile (compteur simple, sans anti-doublon strict)
  async markHelpful(id: string) {
    const question = await this.prisma.questions_produits.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Question introuvable.');
    const updated = await this.prisma.questions_produits.update({
      where: { id },
      data: { utile_count: (question.utile_count ?? 0) + 1 },
    });
    return { utile_count: updated.utile_count };
  }

  // Supprimer (auteur de la question, fournisseur du produit, ou admin)
  async remove(id: string, user: JwtPayload) {
    const question = await this.prisma.questions_produits.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Question introuvable.');

    const isAdmin = user.role === 'admin';
    const isAuthor = question.utilisateur_id === user.id;
    const isOwner =
      isAdmin ||
      isAuthor ||
      (await this.isProductOwner(question.produit_id, user.id));
    if (!isOwner) throw new ForbiddenException('Non autorisé.');

    await this.prisma.questions_produits.delete({ where: { id } });
  }

  // Questions en attente de réponse pour le fournisseur connecté (tableau de bord vendeur)
  getPendingForVendor(userId: string) {
    return this.prisma.questions_produits.findMany({
      where: {
        reponse: null,
        produits: { boutiques: { proprietaire_id: userId } },
      },
      include: {
        auteur: { select: AUTEUR_SELECT },
        produits: { select: { id: true, nom_produit: true, image_url: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
