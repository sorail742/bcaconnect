import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

const normalizeCode = (code: string) =>
  String(code || '')
    .trim()
    .toUpperCase();
const round2 = (n: number) => Math.round(n * 100) / 100;

type QualifyingItem = {
  boutique_id: string;
  quantite: number;
  prix_unitaire_achat: number;
};

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer un coupon — admin (plateforme, boutique_id null) ou fournisseur (sa propre boutique)
  async create(dto: CreateCouponDto, user: JwtPayload) {
    if (!dto.code?.trim())
      throw new BadRequestException('Code, type et valeur sont requis.');
    if (dto.type === 'percentage' && (dto.valeur <= 0 || dto.valeur > 100)) {
      throw new BadRequestException(
        'Une réduction en pourcentage doit être comprise entre 1 et 100.',
      );
    }
    if (dto.type === 'fixed' && dto.valeur <= 0) {
      throw new BadRequestException(
        'Le montant de réduction doit être positif.',
      );
    }

    let boutique_id: string | null = null;
    if (user.role === 'fournisseur') {
      const store = await this.prisma.boutiques.findFirst({
        where: { proprietaire_id: user.id },
      });
      if (!store)
        throw new NotFoundException('Aucune boutique associée à votre compte.');
      boutique_id = store.id;
    }

    const normalizedCode = normalizeCode(dto.code);
    const existing = await this.prisma.coupons.findUnique({
      where: { code: normalizedCode },
    });
    if (existing) throw new BadRequestException('Ce code promo existe déjà.');

    return this.prisma.coupons.create({
      data: {
        id: randomUUID(),
        code: normalizedCode,
        createur_id: user.id,
        boutique_id,
        type: dto.type,
        valeur: dto.valeur,
        montant_min: dto.montant_min ?? null,
        date_debut: dto.date_debut ? new Date(dto.date_debut) : null,
        date_fin: dto.date_fin ? new Date(dto.date_fin) : null,
        usage_max: dto.usage_max ?? null,
        usage_max_par_utilisateur: dto.usage_max_par_utilisateur ?? 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Mes coupons (admin = tous les coupons plateforme ; fournisseur = ceux de sa boutique)
  getMine(user: JwtPayload) {
    const where: Prisma.couponsWhereInput =
      user.role === 'admin' ? {} : { createur_id: user.id };
    return this.prisma.coupons.findMany({
      where,
      include: { boutiques: { select: { id: true, nom_boutique: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleActive(id: string, user: JwtPayload) {
    const coupon = await this.prisma.coupons.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Code promo introuvable.');

    const isAdmin = user.role === 'admin';
    const isOwner = coupon.createur_id === user.id;
    if (!isAdmin && !isOwner) throw new ForbiddenException('Non autorisé.');

    const updated = await this.prisma.coupons.update({
      where: { id },
      data: { actif: !coupon.actif },
    });
    return {
      message: updated.actif ? 'Code promo activé.' : 'Code promo désactivé.',
      coupon: updated,
    };
  }

  async getStats(id: string, user: JwtPayload) {
    const coupon = await this.prisma.coupons.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Code promo introuvable.');

    const isAdmin = user.role === 'admin';
    const isOwner = coupon.createur_id === user.id;
    if (!isAdmin && !isOwner) throw new ForbiddenException('Non autorisé.');

    const [agg, usages] = await Promise.all([
      this.prisma.coupon_usages.aggregate({
        _sum: { montant_reduction: true },
        where: { coupon_id: id },
      }),
      this.prisma.coupon_usages.findMany({
        where: { coupon_id: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      coupon,
      total_reduction_accordee: agg._sum.montant_reduction ?? 0,
      usages,
    };
  }

  // Validation à froid pour l'aperçu panier (sans consommer l'usage) — miroir
  // en lecture seule de coupon.service.js#validate (Sequelize) : ce chemin ne
  // consomme jamais l'usage, donc aucun besoin du verrou transactionnel que
  // garde order.service.js pour la création réelle de commande.
  async validateCart(dto: ValidateCouponDto, user: JwtPayload) {
    const productIds = dto.items
      .map((it) => it.produit_id ?? it.id)
      .filter((id): id is string => !!id);
    const products = await this.prisma.produits.findMany({
      where: { id: { in: productIds } },
      select: { id: true, boutique_id: true, prix_unitaire: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrichedItems = dto.items
      .map((it) => {
        const pid = it.produit_id ?? it.id;
        const product = pid ? productMap.get(pid) : undefined;
        return {
          boutique_id: product?.boutique_id ?? null,
          quantite: it.quantite ?? it.quantity ?? 1,
          prix_unitaire_achat: product
            ? Number(product.prix_unitaire)
            : (it.prix_unitaire ?? 0),
        };
      })
      .filter((it): it is QualifyingItem => it.boutique_id !== null);

    if (enrichedItems.length === 0)
      throw new BadRequestException('Produits du panier introuvables.');

    const { coupon, discount } = await this.validate(
      dto.code,
      user.id,
      enrichedItems,
    );
    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      valeur: Number(coupon.valeur),
      discount,
    };
  }

  private async validate(
    code: string,
    userId: string,
    items: QualifyingItem[],
  ) {
    const normalized = normalizeCode(code);
    if (!normalized) throw new BadRequestException('Code promo requis.');

    const coupon = await this.prisma.coupons.findUnique({
      where: { code: normalized },
    });
    if (!coupon || !coupon.actif)
      throw new BadRequestException('Code promo invalide ou inactif.');

    const now = new Date();
    if (coupon.date_debut && now < coupon.date_debut) {
      throw new BadRequestException("Ce code promo n'est pas encore actif.");
    }
    if (coupon.date_fin && now > coupon.date_fin) {
      throw new BadRequestException('Ce code promo a expiré.');
    }
    if (
      coupon.usage_max !== null &&
      (coupon.usage_count ?? 0) >= coupon.usage_max
    ) {
      throw new BadRequestException(
        "Ce code promo a atteint sa limite d'utilisation.",
      );
    }

    const userUsageCount = await this.prisma.coupon_usages.count({
      where: { coupon_id: coupon.id, utilisateur_id: userId },
    });
    if (userUsageCount >= (coupon.usage_max_par_utilisateur ?? 1)) {
      throw new BadRequestException(
        'Vous avez déjà utilisé ce code promo le nombre maximum de fois autorisé.',
      );
    }

    // Un coupon boutique ne réduit que les articles de cette boutique.
    const qualifyingItems = coupon.boutique_id
      ? items.filter((it) => it.boutique_id === coupon.boutique_id)
      : items;
    if (qualifyingItems.length === 0) {
      throw new BadRequestException(
        "Ce code promo ne s'applique à aucun article de votre panier.",
      );
    }

    const qualifyingSubtotal = qualifyingItems.reduce(
      (sum, it) => sum + it.prix_unitaire_achat * it.quantite,
      0,
    );

    if (coupon.montant_min && qualifyingSubtotal < Number(coupon.montant_min)) {
      throw new BadRequestException(
        `Montant minimum de ${Number(coupon.montant_min).toLocaleString('fr-GN')} GNF requis pour ce code promo.`,
      );
    }

    let discount =
      coupon.type === 'percentage'
        ? qualifyingSubtotal * (Number(coupon.valeur) / 100)
        : Number(coupon.valeur);
    discount = Math.min(discount, qualifyingSubtotal);
    discount = round2(discount);

    return { coupon, discount };
  }
}
