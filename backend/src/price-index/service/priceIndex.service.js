const { OrderItem, Product, Order, Category } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/AppError');

const isUuid = (v) => typeof v === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

/**
 * Regroupe des lignes { prix_unitaire_achat, quantite, created_at } par mois
 * (clé "YYYY-MM") et calcule un prix moyen pondéré par les quantités —
 * fait en JS plutôt qu'en SQL (DATE_TRUNC) pour rester portable entre
 * Postgres (prod/CI) et SQLite (tests, NODE_ENV=test).
 */
function groupByMonth(rows) {
    const buckets = new Map();
    for (const row of rows) {
        const d = new Date(row.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!buckets.has(key)) buckets.set(key, { montantTotal: 0, quantiteTotale: 0, nombreCommandes: 0 });
        const b = buckets.get(key);
        b.montantTotal += parseFloat(row.prix_unitaire_achat) * row.quantite;
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

function withTrend(series) {
    return series.map((point, i) => {
        if (i === 0) return { ...point, variation_pct: null };
        const prev = series[i - 1].prix_moyen;
        const variation_pct = prev > 0 ? Math.round(((point.prix_moyen - prev) / prev) * 1000) / 10 : null;
        return { ...point, variation_pct };
    });
}

// Statuts exclus de l'indice : commande jamais réellement conclue.
const EXCLUDED_STATUSES = ['annulé', 'en_attente_paiement'];

const priceIndexService = {
    async getByCategory(categorieId, { months = 6 } = {}) {
        if (!isUuid(categorieId)) throw new AppError('ID catégorie invalide.', 400);

        const category = await Category.findByPk(categorieId);
        if (!category) throw new AppError('Catégorie non trouvée.', 404);

        const since = new Date();
        since.setMonth(since.getMonth() - months);

        const rows = await OrderItem.findAll({
            attributes: ['prix_unitaire_achat', 'quantite', 'created_at'],
            include: [
                { model: Product, as: 'produit', attributes: [], where: { categorie_id: categorieId }, required: true },
                { model: Order, as: 'commande', attributes: [], where: { statut: { [Op.notIn]: EXCLUDED_STATUSES } }, required: true },
            ],
            where: { created_at: { [Op.gte]: since } },
            raw: true,
        });

        const series = withTrend(groupByMonth(rows));
        return {
            categorie: { id: category.id, nom: category.nom_categorie },
            periode_mois: months,
            points: series,
            echantillon_total: rows.length,
        };
    },

    async getByProduct(produitId, { months = 6 } = {}) {
        if (!isUuid(produitId)) throw new AppError('ID produit invalide.', 400);

        const product = await Product.findByPk(produitId);
        if (!product) throw new AppError('Produit non trouvé.', 404);

        const since = new Date();
        since.setMonth(since.getMonth() - months);

        const rows = await OrderItem.findAll({
            attributes: ['prix_unitaire_achat', 'quantite', 'created_at'],
            include: [
                { model: Order, as: 'commande', attributes: [], where: { statut: { [Op.notIn]: EXCLUDED_STATUSES } }, required: true },
            ],
            where: { produit_id: produitId, created_at: { [Op.gte]: since } },
            raw: true,
        });

        const series = withTrend(groupByMonth(rows));
        return {
            produit: { id: product.id, nom: product.nom_produit },
            periode_mois: months,
            points: series,
            echantillon_total: rows.length,
        };
    },
};

module.exports = priceIndexService;
