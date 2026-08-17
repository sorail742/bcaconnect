import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PriceRow {
  prix_unitaire_achat: unknown;
  quantite: number;
  createdAt: Date;
}

interface MonthBucket {
  montantTotal: number;
  quantiteTotale: number;
  nombreCommandes: number;
}

interface SeriesPoint {
  periode: string;
  prix_moyen: number;
  volume_unites: number;
  nombre_commandes: number;
}

export interface TrendPoint extends SeriesPoint {
  variation_pct: number | null;
}

// Statuts exclus de l'indice : commande jamais réellement conclue.
const EXCLUDED_STATUSES = ['annulé', 'en_attente_paiement'];

// Regroupe des lignes { prix_unitaire_achat, quantite, createdAt } par mois
// (clé "YYYY-MM") et calcule un prix moyen pondéré par les quantités — fait
// en JS plutôt qu'en SQL (DATE_TRUNC), même choix que
// backend/src/price-index/service/priceIndex.service.js (portabilité
// Postgres/SQLite historique côté Express ; conservé ici pour un
// comportement de calcul identique, vérifiable par les mêmes tests).
function groupByMonth(rows: PriceRow[]): SeriesPoint[] {
  const buckets = new Map<string, MonthBucket>();
  for (const row of rows) {
    const d = row.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!buckets.has(key)) buckets.set(key, { montantTotal: 0, quantiteTotale: 0, nombreCommandes: 0 });
    const b = buckets.get(key)!;
    b.montantTotal += Number(row.prix_unitaire_achat) * row.quantite;
    b.quantiteTotale += row.quantite;
    b.nombreCommandes += 1;
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([periode, b]) => ({
      periode,
      prix_moyen: Math.round((b.montantTotal / b.quantiteTotale) * 100) / 100,
      volume_unites: b.quantiteTotale,
      nombre_commandes: b.nombreCommandes,
    }));
}

function withTrend(series: SeriesPoint[]): TrendPoint[] {
  return series.map((point, i) => {
    if (i === 0) return { ...point, variation_pct: null };
    const prev = series[i - 1].prix_moyen;
    const variation_pct = prev > 0 ? Math.round(((point.prix_moyen - prev) / prev) * 1000) / 10 : null;
    return { ...point, variation_pct };
  });
}

function monthsAgo(months: number): Date {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  return since;
}

@Injectable()
export class PriceIndexService {
  constructor(private readonly prisma: PrismaService) {}

  async getByCategory(categorieId: string, months: number) {
    const category = await this.prisma.categories.findUnique({ where: { id: categorieId } });
    if (!category) throw new NotFoundException('Catégorie non trouvée.');

    const rows = await this.prisma.details_commandes.findMany({
      where: {
        createdAt: { gte: monthsAgo(months) },
        produits: { categorie_id: categorieId },
        commandes: { statut: { notIn: EXCLUDED_STATUSES } },
      },
      select: { prix_unitaire_achat: true, quantite: true, createdAt: true },
    });

    const series = withTrend(groupByMonth(rows));
    return {
      categorie: { id: category.id, nom: category.nom_categorie },
      periode_mois: months,
      points: series,
      echantillon_total: rows.length,
    };
  }

  async getByProduct(produitId: string, months: number) {
    const product = await this.prisma.produits.findUnique({ where: { id: produitId } });
    if (!product) throw new NotFoundException('Produit non trouvé.');

    const rows = await this.prisma.details_commandes.findMany({
      where: {
        produit_id: produitId,
        createdAt: { gte: monthsAgo(months) },
        commandes: { statut: { notIn: EXCLUDED_STATUSES } },
      },
      select: { prix_unitaire_achat: true, quantite: true, createdAt: true },
    });

    const series = withTrend(groupByMonth(rows));
    return {
      produit: { id: product.id, nom: product.nom_produit },
      periode_mois: months,
      points: series,
      echantillon_total: rows.length,
    };
  }
}
