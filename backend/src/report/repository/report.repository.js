const { Op } = require('sequelize');
const { Order, OrderItem, Litige, Transaction, DeliveryLog } = require('../../models');

const reportRepository = {
    findVendorOrderItems(fournisseur_id) {
        return OrderItem.findAll({
            where: { fournisseur_id, statut: { [Op.notIn]: ['annule', 'refuse'] } },
            include: [{ model: Order, as: 'commande', where: { statut: 'payé' }, required: true }],
        });
    },

    countVendorLitiges(fournisseur_id) {
        return Litige.count({ where: { defenseur_id: fournisseur_id } });
    },

    findUserExpenses(utilisateur_id, startDate) {
        return Transaction.findAll({
            where: {
                created_at: { [Op.gte]: startDate },
                statut: 'complete',
                type_transaction: { [Op.in]: ['achat_produit', 'paiement'] },
            },
            include: [{
                model: Order,
                where: { utilisateur_id },
                required: true,
                attributes: ['id'],
            }],
            attributes: ['id', 'montant', 'created_at'],
        });
    },

    findDeliveredOrdersWithTracking() {
        return Order.findAll({
            where: { statut_livraison: 'livre' },
            attributes: ['id', 'created_at'],
            include: [{
                model: DeliveryLog,
                as: 'tracking_history',
                where: { statut: 'livre' },
                attributes: ['created_at'],
                required: true,
            }],
        });
    },
};

module.exports = reportRepository;
