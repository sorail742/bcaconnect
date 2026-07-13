const { Order, OrderItem, User, Product, Litige, Transaction, DeliveryLog, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');

const reportController = {
    /**
     * Rapport de Performance Fournisseur
     */
    getVendorPerformance: catchAsync(async (req, res, next) => {
        const fournisseur_id = req.user.id;

        // Chiffre d'affaires total
        const items = await OrderItem.findAll({
            where: { fournisseur_id, statut: { [Op.notIn]: ['annule', 'refuse'] } },
            include: [{ model: Order, as: 'commande', where: { statut: 'payé' }, required: true }]
        });

        const totalRevenue = items.reduce((sum, item) => sum + (parseFloat(item.prix_unitaire_achat || 0) * item.quantite), 0);
        const totalSales = items.reduce((sum, item) => sum + item.quantite, 0);

        // Litiges impliquant ce fournisseur en tant que défenseur
        const litigesCount = await Litige.count({
            where: { defenseur_id: fournisseur_id }
        });

        // Délais de livraison moyen (Basé sur la date de création de la commande vs date de livraison)
        // Note : C'est une approximation car le vendeur expédie, mais le livreur livre.
        
        res.json({
            fournisseur_id,
            totalRevenue,
            totalSales,
            litigesCount,
            message: 'Rapport de performance généré avec succès'
        });
    }),

    /**
     * Rapport des Dépenses (Client ou ONG)
     */
    getExpenseReport: catchAsync(async (req, res, next) => {
        const utilisateur_id = req.user.id;
        const { period = '30D' } = req.query; // Période d'analyse

        let days = 30;
        if (period === '7D') days = 7;
        else if (period === '90D') days = 90;
        else if (period === '1Y') days = 365;

        const startDate = new Date(new Date().getTime() - (days * 24 * 60 * 60 * 1000));

        const expenses = await Transaction.findAll({
            where: {
                created_at: { [Op.gte]: startDate },
                statut: 'complete',
                type_transaction: { [Op.in]: ['achat_produit', 'paiement'] }
            },
            include: [{
                model: Order,
                where: { utilisateur_id },
                required: true,
                attributes: ['id']
            }],
            attributes: ['id', 'montant', 'created_at']
        });

        const totalSpent = expenses.reduce((sum, tx) => sum + parseFloat(tx.montant || 0), 0);

        res.json({
            period,
            totalSpent,
            transactionsCount: expenses.length,
            expenses
        });
    }),

    /**
     * KPI Globaux des Délais de Livraison
     */
    getDeliveryKPI: catchAsync(async (req, res, next) => {
        // Analyser les logs de livraison pour déterminer le temps moyen entre 'creation' et 'livre'
        const deliveredOrders = await Order.findAll({
            where: { statut_livraison: 'livre' },
            attributes: ['id', 'created_at'],
            include: [{
                model: DeliveryLog,
                as: 'tracking_history',
                where: { statut: 'livre' },
                attributes: ['created_at'],
                required: true
            }]
        });

        if (deliveredOrders.length === 0) {
            return res.json({ averageDeliveryTimeHours: 0, ordersAnalyzed: 0 });
        }

        let totalHours = 0;
        deliveredOrders.forEach(order => {
            const orderDate = new Date(order.created_at);
            const deliveryLog = order.tracking_history[0]; // Log de livraison
            if (deliveryLog) {
                const deliveryDate = new Date(deliveryLog.created_at);
                const diffMs = deliveryDate - orderDate;
                totalHours += diffMs / (1000 * 60 * 60);
            }
        });

        const averageDeliveryTimeHours = totalHours / deliveredOrders.length;

        res.json({
            averageDeliveryTimeHours: averageDeliveryTimeHours.toFixed(2),
            ordersAnalyzed: deliveredOrders.length,
            message: 'Temps moyen de livraison estimé en heures.'
        });
    })
};

module.exports = reportController;
