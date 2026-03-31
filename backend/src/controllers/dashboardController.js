const { Order, OrderItem, User, Store, Transaction, Product, Wallet, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper pour générer une timeserie des X derniers jours basée sur un champ de date et de valeur
const generateTimeseries = (records, dateField, valueField, numDays = 7) => {
    const timeseries = [];
    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const dateStr = d.toISOString().split('T')[0];
        
        const daysFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const dayName = daysFr[d.getDay()];

        const dayTotal = records
            .filter(r => {
                const recDate = new Date(r[dateField]);
                return recDate.toISOString().split('T')[0] === dateStr;
            })
            .reduce((sum, r) => sum + parseFloat(r[valueField] || 0), 0);

        timeseries.push({ day: dayName, val: dayTotal, date: dateStr });
    }
    return timeseries;
};

const dashboardController = {
    /**
     * Statistiques Globales (Admin)
     */
    getAdminStats: async (req, res, next) => {
        try {
            // 1. Chiffre d'Affaires Global (GMV)
            const gmv = await Order.sum('total_ttc', { where: { statut: 'payé' } }) || 0;

            const totalUsers = await User.count();
            const activeProducts = await Product.count();
            const storesCount = await Store.count();

            // Croissance: Derniers 30 jours vs mois précédent
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

            // Timeseries 7 jours pour Admin
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            const orders7Days = await Order.findAll({
                where: { created_at: { [Op.gte]: sevenDaysAgo }, statut: 'payé' },
                attributes: ['created_at', 'total_ttc']
            });
            const timeseries = generateTimeseries(orders7Days, 'created_at', 'total_ttc', 7);

            // Transactions récentes
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
                        trendValue: '+X%', 
                        description: 'Clients & Partenaires'
                    },
                    {
                        title: 'Transactions (Globales)',
                        value: `${gmv.toLocaleString()} GNF`,
                        icon: 'CreditCard',
                        trend: growth >= 0 ? 'up' : 'down',
                        trendValue: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
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
                    delta: growth.toFixed(1),
                    timeseries
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
            const totalDeposits = await Transaction.sum('montant', {
                where: { type_transaction: 'depot', statut: 'complete' }
            }) || 0;

            const pendingDeposits = await Transaction.count({
                where: { type_transaction: 'depot', statut: 'en_attente' }
            });

            const pendingWithdrawals = await Transaction.count({
                where: { type_transaction: 'retrait', statut: 'en_attente' }
            });

            const processedCount = await Transaction.count({
                where: { statut: 'complete' }
            });

            // Calcul du Vrai Delta Financier
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

            const currentDeposits = await Transaction.sum('montant', {
                where: { type_transaction: 'depot', statut: 'complete', created_at: { [Op.gte]: thirtyDaysAgo } }
            }) || 0;
            const previousDeposits = await Transaction.sum('montant', {
                where: { type_transaction: 'depot', statut: 'complete', created_at: { [Op.between]: [thirtyDaysAgo, sixtyDaysAgo] } }
            }) || 0;

            const growth = previousDeposits === 0 ? 100 : ((currentDeposits - previousDeposits) / previousDeposits) * 100;

            // Graphique des dépôts des 7 derniers jours
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            const deposits7Days = await Transaction.findAll({
                where: { type_transaction: 'depot', statut: 'complete', created_at: { [Op.gte]: sevenDaysAgo } },
                attributes: ['created_at', 'montant']
            });
            const timeseries = generateTimeseries(deposits7Days, 'created_at', 'montant', 7);

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
                    { title: 'Dépôts totaux', value: `${totalDeposits.toLocaleString()} GNF`, trendValue: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`, trend: growth >= 0 ? 'up' : 'down' },
                    { title: 'Dépôts en attente', value: pendingDeposits.toString(), trendValue: 'Stable', trend: 'up' },
                    { title: 'Retraits en attente', value: pendingWithdrawals.toString(), trendValue: 'Stable', trend: 'down' },
                    { title: 'Transactions traitées', value: processedCount.toLocaleString(), trendValue: '+X%', trend: 'up' },
                ],
                transactions: formattedTransactions,
                chartData: {
                    total: totalDeposits,
                    delta: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
                    timeseries
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Statistiques Vendeur (Vendor Dashboard)
     */
    getVendorStats: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

            // On récupère toutes les items vendus par ce vendeur dans des commandes payées
            const vendorItems = await OrderItem.findAll({
                where: { fournisseur_id: userId },
                include: [{
                    model: Order,
                    as: 'commande',
                    where: { statut: 'payé' },
                    required: true,
                    attributes: ['created_at']
                }]
            });

            // Flatten data via la structure des OrderItems
            const flatData = vendorItems.map(item => ({
                created_at: item.commande.created_at,
                revenue: parseFloat(item.prix_unitaire_achat) * item.quantite
            }));

            const totalRevenue = flatData.reduce((acc, r) => acc + r.revenue, 0);

            // Timeseries des 7 derniers jours
            const recentItems = flatData.filter(r => new Date(r.created_at) >= sevenDaysAgo);
            const timeseries = generateTimeseries(recentItems, 'created_at', 'revenue', 7);

            // Croissance
            const currentRevenue = flatData
                .filter(r => new Date(r.created_at) >= thirtyDaysAgo)
                .reduce((acc, r) => acc + r.revenue, 0);
            
            const prevRevenue = flatData
                .filter(r => {
                    const d = new Date(r.created_at);
                    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
                })
                .reduce((acc, r) => acc + r.revenue, 0);

            const growth = prevRevenue === 0 ? 100 : ((currentRevenue - prevRevenue) / prevRevenue) * 100;
            const global_trend = growth >= 0 
                ? `Analyse IA : Votre boutique est en croissance de +${growth.toFixed(1)}%. Optimisez vos stocks pour maintenir la cadence.`
                : `Analyse IA : Vos ventes sont en baisse de ${Math.abs(growth).toFixed(1)}%. C'est le moment idéal pour lancer une offre spéciale.`;

            res.json({
                totalRevenue,
                growth: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
                timeseries,
                global_trend
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = dashboardController;
