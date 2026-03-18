const { Order, OrderItem, User, Store, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
    /**
     * Statistiques Globales (Admin)
     */
    getAdminStats: async (req, res, next) => {
        try {
            // 1. Chiffre d'Affaires Global (GMV)
            const gmv = await Order.sum('total_ttc', { where: { statut: 'payé' } }) || 0;

            // 2. Revenus BCA (Commissions de 10% par exemple, simulé)
            const bcaRevenue = gmv * 0.10;

            // 3. Répartition des Utilisateurs
            const userCounts = await User.findAll({
                attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['role']
            });

            // 4. Croissance des Commandes (Derniers 30 jours vs mois précédent)
            const now = new Date();
            const last30Days = new Date(now.setDate(now.getDate() - 30));
            const prev30Days = new Date(new Date(last30Days).setDate(last30Days.getDate() - 30));

            const currentOrders = await Order.count({
                where: { created_at: { [Op.gte]: last30Days }, statut: 'payé' }
            });
            const previousOrders = await Order.count({
                where: { created_at: { [Op.between]: [prev30Days, last30Days] }, statut: 'payé' }
            });

            const growth = previousOrders === 0 ? 100 : ((currentOrders - previousOrders) / previousOrders) * 100;

            // 5. Top Catégories vendues
            // (Note: nécessite un lien complexe OrderItem -> Product -> Category)
            // Simulé ici pour la démo
            const topCategories = [
                { name: 'Électronique', value: 45 },
                { name: 'Mode', value: 30 },
                { name: 'Alimentation', value: 25 }
            ];

            res.json({
                overview: {
                    gmv,
                    bca_revenue: bcaRevenue,
                    total_orders: currentOrders,
                    growth_rate: growth.toFixed(2)
                },
                users: userCounts,
                categories: topCategories,
                recent_activity: "Analyse IA : Forte demande sur les produits solaires prévue pour le mois prochain."
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Statistiques Financières Détaillées (Panel Banque)
     */
    getFinancialReports: async (req, res, next) => {
        try {
            // Volume des transactions par type
            const transactionStats = await Transaction.findAll({
                attributes: ['type_transaction', [sequelize.fn('SUM', sequelize.col('montant')), 'total']],
                where: { statut: 'complete' },
                group: ['type_transaction']
            });

            res.json(transactionStats);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = dashboardController;
