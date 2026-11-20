import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { CreatePartnerStockDto } from './dto/create-partner-stock.dto';
import { UpdatePartnerStockDto } from './dto/update-partner-stock.dto';

@Injectable()
export class PartnerStockService {
  constructor(private readonly prisma: PrismaService) {}

  // Réplique assertOwnsProduct (backend/src/partner-stock/service/
  // partnerStock.service.js) : traverse produits -> boutiques, toutes deux
  // encore possédées par Sequelize (lecture seule, modélisation partielle
  // dans schema.prisma).
  private async assertOwnsProduct(produitId: string, user: JwtPayload) {
    const product = await this.prisma.produits.findUnique({
      where: { id: produitId },
      include: { boutiques: true },
    });
    if (!product) throw new NotFoundException('Produit non trouvé.');
    if (product.boutiques?.proprietaire_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Action non autorisée sur ce produit.');
    }
    return product;
  }

  async listByProduct(produitId: string, user: JwtPayload) {
    await this.assertOwnsProduct(produitId, user);
    return this.prisma.stocks_partenaires.findMany({ where: { produit_id: produitId }, orderBy: { createdAt: 'asc' } });
  }

  async create(produitId: string, dto: CreatePartnerStockDto, user: JwtPayload) {
    await this.assertOwnsProduct(produitId, user);
    return this.prisma.stocks_partenaires.create({
      data: {
        id: randomUUID(),
        produit_id: produitId,
        partenaire_nom: dto.partenaire_nom.trim(),
        partenaire_contact: dto.partenaire_contact ?? null,
        type_stock: dto.type_stock ?? 'entrepot_tiers',
        quantite: dto.quantite ?? 0,
        localisation: dto.localisation ?? null,
        notes: dto.notes ?? null,
        derniere_synchro: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, dto: UpdatePartnerStockDto, user: JwtPayload) {
    const entry = await this.prisma.stocks_partenaires.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Entrée de stock partenaire non trouvée.');
    await this.assertOwnsProduct(entry.produit_id, user);

    return this.prisma.stocks_partenaires.update({
      where: { id },
      data: {
        partenaire_nom: dto.partenaire_nom,
        partenaire_contact: dto.partenaire_contact,
        type_stock: dto.type_stock,
        quantite: dto.quantite,
        localisation: dto.localisation,
        notes: dto.notes,
        derniere_synchro: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, user: JwtPayload) {
    const entry = await this.prisma.stocks_partenaires.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Entrée de stock partenaire non trouvée.');
    await this.assertOwnsProduct(entry.produit_id, user);
    await this.prisma.stocks_partenaires.delete({ where: { id } });
    return { message: 'Entrée de stock partenaire supprimée.' };
  }

  async getTotalStock(produitId: string, user: JwtPayload) {
    const product = await this.assertOwnsProduct(produitId, user);
    const entries = await this.prisma.stocks_partenaires.findMany({ where: { produit_id: produitId } });
    const stockPartenaires = entries.reduce((sum, e) => sum + e.quantite, 0);
    const stockPropre = product.stock_quantite ?? 0;
    return {
      stock_propre: stockPropre,
      stock_partenaires: stockPartenaires,
      stock_total: stockPropre + stockPartenaires,
      detail: entries,
    };
  }
}
