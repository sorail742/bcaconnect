const { Order, OrderItem, User, Store, Transaction, Product, Wallet, sequelize } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
    /**
     * Statistiques Globales (Admin)
     */
    getAdminStats: async (req, res, next) => {
        try {
            // 1. Chiffre d'Affaires Global (GMV) - Somme des commandes payées
            const gmv = await Order.sum('total_ttc', { where: { statut: 'payé' } }) || 0;

            // 2. Utilisateurs Totaux
            const totalUsers = await User.count();

            // 3. Produits Actifs
            const activeProducts = await Product.count();

            // 4. Boutiques actives
            const storesCount = await Store.count();

            // 5. Croissance des Commandes (Derniers 30 jours vs mois précédent)
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

            const currentOrdersCount = await Order.count({
                where: { created_at: { [Op.gte]: thirtyDaysAgo }, statut: 'payé' }
            });
            const previousOrdersCount = await Order.count({
                where: { created_at: { [Op.between]: [thirtyDaysAgo, sixtyDaysAgo] }, statut: 'payé' }
            });

            const growth = previousOrdersCount === 0 ? 100 : ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100;

            // 6. Transactions récentes (Dernières 5 commandes payées)
            const recentOrders = await Order.findAll({
                limit: 5,
                order: [['created_at', 'DESC']],
                include: [{ model: User, as: 'client', attributes: ['nom_complet'] }]
            });

            const formattedTransactions = recentOrders.map(order => ({
                id: order.id,
                name: `Commande #${order.id.substring(0, 8)}`,
                time: `Par ${order.client?.nom_complet || 'Client'}`,
                cat: 'Vente',
                amount: `${order.total_ttc.toLocaleString()} GNF`,
                status: order.statut.charAt(0).toUpperCase() + order.statut.slice(1),
                statusType: order.statut === 'payé' ? 'success' : 'warning'
            }));

            res.json({
                stats: [
                    {
                        title: "Utilisateurs totaux",
                        value: totalUsers.toLocaleString(),
                        icon: 'Users',
                        trend: 'up',
                        trendValue: '+X%', // À calculer plus finement si besoin
                        description: 'Clients & Partenaires'
                    },
                    {
                        title: 'Transactions (Globales)',
                        value: `${gmv.toLocaleString()} GNF`,
                        icon: 'CreditCard',
                        trend: growth >= 0 ? 'up' : 'down',
                        trendValue: `${growth.toFixed(1)}%`,
                        description: 'Volume total'
                    },
                    {
                        title: 'Produits actifs',
                        value: activeProducts.toString(),
                        icon: 'Package',
                        trend: 'up',
                        trendValue: 'stable',
                        description: 'Catalogue multi-fournisseurs'
                    },
                ],
                recentTransactions: formattedTransactions,
                overview: {
                    gmv,
                    total_orders: currentOrdersCount,
                    growth_rate: growth.toFixed(2),
                    storesCount
                },
                weeklyChart: {
                    total: gmv,
                    delta: growth.toFixed(1)
                }
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
            // 1. Dépôts Totaux (Somme des transactions de type 'depot' validées)
            const totalDeposits = await Transaction.sum('montant', {
                where: { type_transaction: 'depot', statut: 'complete' }
            }) || 0;

            // 2. Dépôts en attente
            const pendingDeposits = await Transaction.count({
                where: { type_transaction: 'depot', statut: 'en_attente' }
            });

            // 3. Retraits en attente
            const pendingWithdrawals = await Transaction.count({
                where: { type_transaction: 'retrait', statut: 'en_attente' }
            });

            // 4. Transactions traitées (Toutes les transactions complétées)
            const processedCount = await Transaction.count({
                where: { statut: 'complete' }
            });

            // 5. Transactions récentes (Dernières 5)
            const recentTransactions = await Transaction.findAll({
                limit: 5,
                order: [['created_at', 'DESC']],
                include: [{
                    model: Wallet,
                    include: [{ model: User, attributes: ['nom_complet'] }]
                }]
            });

            const formattedTransactions = recentTransactions.map(tx => ({
                id: `#TRX-${tx.id.substring(0, 4).toUpperCase()}`,
                user: tx.Wallet?.User?.nom_complet || 'Utilisateur inconnu',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.Wallet?.User?.nom_complet || 'U')}&background=random`,
                type: tx.type_transaction === 'depot' ? 'Dépôt' : tx.type_transaction === 'retrait' ? 'Retrait' : 'Paiement',
                typeVariant: tx.type_transaction === 'depot' ? 'info' : tx.type_transaction === 'retrait' ? 'secondary' : 'warning',
                amount: `${tx.montant.toLocaleString()} GNF`,
                method: tx.metadata?.methode || 'Système',
                status: tx.statut === 'complete' ? 'Approuvé' : tx.statut === 'en_attente' ? 'En attente' : 'Rejeté',
                statusVariant: tx.statut === 'complete' ? 'success' : tx.statut === 'en_attente' ? 'warning' : 'danger',
                date: new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
            }));

            res.json({
                stats: [
                    { title: 'Dépôts totaux', value: `${totalDeposits.toLocaleString()} GNF`, trendValue: '+X%', trend: 'up' },
                    { title: 'Dépôts en attente', value: pendingDeposits.toString(), trendValue: 'Stable', trend: 'up' },
                    { title: 'Retraits en attente', value: pendingWithdrawals.toString(), trendValue: 'Stable', trend: 'down' },
                    { title: 'Transactions traitées', value: processedCount.toLocaleString(), trendValue: '+X%', trend: 'up' },
                ],
                transactions: formattedTransactions,
                chartData: {
                    total: totalDeposits,
                    delta: "+8.2%" // Temporaire
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = dashboardController;
