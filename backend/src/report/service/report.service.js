const reportRepository = require('../repository/report.repository');

const reportService = {
    async getVendorPerformance(fournisseur_id) {
        const items = await reportRepository.findVendorOrderItems(fournisseur_id);

        const totalRevenue = items.reduce((sum, item) => sum + (parseFloat(item.prix_unitaire_achat || 0) * item.quantite), 0);
        const totalSales = items.reduce((sum, item) => sum + item.quantite, 0);

        const litigesCount = await reportRepository.countVendorLitiges(fournisseur_id);

        return {
            fournisseur_id,
            totalRevenue,
            totalSales,
            litigesCount,
            message: 'Rapport de performance généré avec succès',
        };
    },

    async getExpenseReport(utilisateur_id, period = '30D') {
        let days = 30;
        if (period === '7D') days = 7;
        else if (period === '90D') days = 90;
        else if (period === '1Y') days = 365;

        const startDate = new Date(new Date().getTime() - (days * 24 * 60 * 60 * 1000));

        const expenses = await reportRepository.findUserExpenses(utilisateur_id, startDate);
        const totalSpent = expenses.reduce((sum, tx) => sum + parseFloat(tx.montant || 0), 0);

        return {
            period,
            totalSpent,
            transactionsCount: expenses.length,
            expenses,
        };
    },

    async getDeliveryKPI() {
        // Analyse les logs de livraison pour déterminer le temps moyen entre 'creation' et 'livre'
        const deliveredOrders = await reportRepository.findDeliveredOrdersWithTracking();

        if (deliveredOrders.length === 0) {
            return { averageDeliveryTimeHours: 0, ordersAnalyzed: 0 };
        }

        let totalHours = 0;
        deliveredOrders.forEach(order => {
            const orderDate = new Date(order.created_at);
            const deliveryLog = order.tracking_history[0];
            if (deliveryLog) {
                const deliveryDate = new Date(deliveryLog.created_at);
                const diffMs = deliveryDate - orderDate;
                totalHours += diffMs / (1000 * 60 * 60);
            }
        });

        const averageDeliveryTimeHours = totalHours / deliveredOrders.length;

        return {
            averageDeliveryTimeHours: averageDeliveryTimeHours.toFixed(2),
            ordersAnalyzed: deliveredOrders.length,
            message: 'Temps moyen de livraison estimé en heures.',
        };
    },
};

module.exports = reportService;
