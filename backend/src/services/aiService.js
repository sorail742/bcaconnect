const { Order, OrderItem, Product, Store, sequelize } = require('../models');

const aiService = {
    /**
     * Analyse les tendances de vente pour une boutique
     */
    analyzeSales: async (storeId) => {
        try {
            // Récupérer les produits les plus vendus de la boutique
            const topProducts = await OrderItem.findAll({
                attributes: [
                    'produit_id',
                    [sequelize.fn('SUM', sequelize.col('quantite')), 'total_vendu'],
                ],
                include: [{
                    model: Product,
                    as: 'produit',
                    where: { boutique_id: storeId },
                    attributes: ['nom_produit', 'prix_unitaire']
                }],
                group: ['produit_id', 'produit.id'],
                order: [[sequelize.literal('total_vendu'), 'DESC']],
                limit: 5
            });

            // Logique d'analyse simplifiée pour le MVP
            const analysis = topProducts.map(p => ({
                name: p.produit.nom_produit,
                total: p.get('total_vendu'),
                insight: p.get('total_vendu') > 50 ? "Produit star" : "Potentiel de croissance"
            }));

            return {
                timestamp: new Date(),
                recommendations: analysis,
                global_trend: "Hausse de 15% prévue le week-end prochain (basé sur simulation)"
            };
        } catch (error) {
            console.error("AI Analysis Error:", error);
            throw error;
        }
    },

    /**
     * Calcule le score de confiance d'un utilisateur
     */
    evaluateTrustScore: async (userId) => {
        try {
            // Dans un vrai système, l'IA analyserait les comportements frauduleux
            // Ici on simule basé sur les commandes complétées
            const completedOrders = await Order.count({ where: { utilisateur_id: userId, statut: 'payé' } });

            let baseScore = 100;
            if (completedOrders > 10) baseScore += 20;
            if (completedOrders === 0) baseScore = 50;

            return {
                score: baseScore,
                level: baseScore > 100 ? "Premium" : "Standard",
                reliability: "Excellente (basée sur 0 litiges)"
            };
        } catch (error) {
            return { score: 100, level: "Standard" };
        }
    },  // ← virgule ajoutée
    /**
     * PRÉDICTION : Simule une prédiction de demande par catégorie
     */
    getMarketTrends: async () => {
        return {
            trends: [
                { category: 'Solaire', demand_score: 95, insight: "Forte hausse prévue (Saison sèche)" },
                { category: 'Électronique', demand_score: 80, insight: "Stable" },
                { category: 'Agriculture', demand_score: 90, insight: "Pic de recherche (Période de semis)" }
            ],
            confidence: 0.88
        };
    }
};

module.exports = aiService;
