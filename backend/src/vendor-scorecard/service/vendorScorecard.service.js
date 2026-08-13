const { OrderItem, Litige, Review, Product, Store, User } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/AppError');

const isUuid = (v) => typeof v === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

// Ordres n'ayant jamais réellement abouti — exclus du volume de référence
// (un litige ou une note sur une commande annulée ne reflète pas la fiabilité).
const EXCLUDED_ITEM_STATUSES = ['annule', 'annulé'];

function scoreFromRatio(ratio, { invert = false } = {}) {
    // Convertit un ratio [0,1] en note /20, inversée pour les indicateurs négatifs (ex. taux de litige).
    const clamped = Math.min(1, Math.max(0, ratio));
    return Math.round((invert ? 1 - clamped : clamped) * 20 * 10) / 10;
}

const vendorScorecardService = {
    /**
     * Préqualification / scorecard fournisseur (analyse concurrentielle #6) —
     * construit uniquement à partir de données transactionnelles déjà
     * collectées (litiges, avis, ancienneté, temps de réponse), pas de
     * saisie manuelle. Score /100 = somme de 5 sous-scores /20.
     */
    async getScorecard(vendorId) {
        if (!isUuid(vendorId)) throw new AppError('ID fournisseur invalide.', 400);

        const vendor = await User.findByPk(vendorId, { attributes: ['id', 'nom_complet', 'role'] });
        if (!vendor || vendor.role !== 'fournisseur') throw new AppError('Fournisseur non trouvé.', 404);

        const store = await Store.findOne({ where: { proprietaire_id: vendorId } });

        const totalItems = await OrderItem.count({
            where: { fournisseur_id: vendorId, statut: { [Op.notIn]: EXCLUDED_ITEM_STATUSES } },
        });

        const distinctOrderIds = await OrderItem.findAll({
            where: { fournisseur_id: vendorId, statut: { [Op.notIn]: EXCLUDED_ITEM_STATUSES } },
            attributes: ['commande_id'],
            group: ['commande_id'],
            raw: true,
        });
        const totalOrders = distinctOrderIds.length;

        const disputedOrders = totalOrders > 0
            ? await Litige.count({
                where: {
                    defenseur_id: vendorId,
                    commande_id: { [Op.in]: distinctOrderIds.map((r) => r.commande_id) },
                },
                distinct: true,
                col: 'commande_id',
            })
            : 0;

        const reviewAgg = await Review.findOne({
            attributes: [
                [Review.sequelize.fn('AVG', Review.sequelize.col('note')), 'moyenne'],
                [Review.sequelize.fn('COUNT', Review.sequelize.col('Review.id')), 'total'],
            ],
            include: [{
                model: Product,
                attributes: [],
                required: true,
                where: { boutique_id: store?.id || null },
            }],
            raw: true,
        });
        const noteMoyenne = reviewAgg?.moyenne ? Math.round(parseFloat(reviewAgg.moyenne) * 10) / 10 : null;
        const nombreAvis = parseInt(reviewAgg?.total || 0, 10);

        const ancienneteJours = store?.createdAt
            ? Math.floor((Date.now() - new Date(store.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        // ── Sous-scores /20 ──────────────────────────────────────────
        const scoreVolume = scoreFromRatio(Math.min(totalOrders / 50, 1)); // plafonné à 50 commandes = score max
        const scoreLitiges = totalOrders > 0 ? scoreFromRatio(disputedOrders / totalOrders, { invert: true }) : 10; // neutre si aucune donnée
        const scoreAvis = noteMoyenne !== null ? scoreFromRatio(noteMoyenne / 5) : 10;
        const scoreAnciennete = scoreFromRatio(Math.min(ancienneteJours / 365, 1)); // plafonné à 1 an
        const tempsReponseMinutes = store?.temps_reponse ?? null;
        const scoreReactivite = tempsReponseMinutes !== null
            ? scoreFromRatio(1 - Math.min(tempsReponseMinutes / (24 * 60), 1)) // 24h = score min
            : 10;

        const scoreTotal = Math.round((scoreVolume + scoreLitiges + scoreAvis + scoreAnciennete + scoreReactivite) * 10) / 10;

        let niveau;
        if (totalOrders < 3) niveau = 'donnees_insuffisantes';
        else if (scoreTotal >= 75) niveau = 'excellent';
        else if (scoreTotal >= 50) niveau = 'fiable';
        else niveau = 'a_surveiller';

        return {
            fournisseur: { id: vendor.id, nom: vendor.nom_complet },
            niveau,
            score_total: scoreTotal,
            details: {
                volume: { valeur: totalOrders, score: scoreVolume, label: 'Commandes complétées' },
                litiges: { valeur: totalOrders > 0 ? Math.round((disputedOrders / totalOrders) * 1000) / 10 : null, score: scoreLitiges, label: 'Taux de litige (%)' },
                avis: { valeur: noteMoyenne, score: scoreAvis, label: 'Note moyenne (/5)', echantillon: nombreAvis },
                anciennete: { valeur: ancienneteJours, score: scoreAnciennete, label: 'Ancienneté (jours)' },
                reactivite: { valeur: tempsReponseMinutes, score: scoreReactivite, label: 'Temps de réponse (min)' },
            },
        };
    },
};

module.exports = vendorScorecardService;
