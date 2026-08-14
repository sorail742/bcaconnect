const { Op } = require('sequelize');
const {
    Order, OrderItem, User, Store, Transaction, Product, Wallet, Category, Litige, Review, sequelize,
} = require('../../models');

const dashboardRepository = {
    getDialect() {
        return sequelize.getDialect();
    },

    // --- Admin / Landing shared aggregates ---
    sumPaidOrdersTotal() {
        return Order.sum('total_ttc', { where: { statut: 'payé' } });
    },

    countUsers(where = {}) {
        return User.count({ where });
    },

    countActiveProducts() {
        return Product.count();
    },

    countStores() {
        return Store.count();
    },

    countPaidOrders() {
        return Order.count({ where: { statut: 'payé' } });
    },

    countDisputes() {
        return Litige.count();
    },

    findAverageReviewNote(where = {}) {
        return Review.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('note')), 'avgNote']],
            where,
            raw: true,
        });
    },

    countReviews(where = {}) {
        return Review.count({ where });
    },

    countOrdersInRange(start, end) {
        return Order.count({ where: { created_at: { [Op.between]: [start, end] }, statut: 'payé' } });
    },

    countOrdersSince(start) {
        return Order.count({ where: { created_at: { [Op.gte]: start }, statut: 'payé' } });
    },

    findPaidOrdersSince(start) {
        return Order.findAll({
            where: { created_at: { [Op.gte]: start }, statut: 'payé' },
            attributes: ['created_at', 'total_ttc'],
        });
    },

    findRecentOrdersWithClient(limit = 5) {
        return Order.findAll({
            limit,
            order: [['created_at', 'DESC']],
            include: [{ model: User, as: 'client', attributes: ['nom_complet'] }],
        });
    },

    findFeaturedReviews(limit = 6) {
        return Review.findAll({
            where: {
                est_approuve: true,
                commentaire: { [Op.ne]: '' },
            },
            include: [{ model: User, attributes: ['nom_complet', 'role', 'categorie_activite'] }],
            order: [['created_at', 'DESC']],
            limit,
        });
    },

    // --- Financial ---
    sumTransactions(where) {
        return Transaction.sum('montant', { where });
    },

    countTransactions(where) {
        return Transaction.count({ where });
    },

    findTransactionsSince(type_transaction, start) {
        return Transaction.findAll({
            where: { type_transaction, statut: 'complete', created_at: { [Op.gte]: start } },
            attributes: ['created_at', 'montant'],
        });
    },

    findRecentTransactionsWithUser(limit = 5) {
        return Transaction.findAll({
            limit,
            order: [['created_at', 'DESC']],
            include: [{ model: Wallet, include: [{ model: User, attributes: ['nom_complet'] }] }],
        });
    },

    // --- Vendor ---
    findVendorOrderItems(fournisseurId, validStatuts) {
        return OrderItem.findAll({
            where: { fournisseur_id: fournisseurId },
            include: [
                {
                    model: Order,
                    as: 'commande',
                    where: { statut: validStatuts },
                    required: true,
                    attributes: ['id', 'created_at', 'createdAt'],
                },
                {
                    model: Product,
                    as: 'produit',
                    attributes: ['id', 'nom_produit'],
                    required: false,
                },
            ],
        });
    },

    findStoreByOwner(ownerId) {
        return Store.findOne({ where: { proprietaire_id: ownerId }, attributes: ['id'] });
    },

    countInStockProducts(boutiqueId) {
        return Product.count({ where: { boutique_id: boutiqueId, stock_quantite: { [Op.gt]: 0 } } });
    },

    // --- Trends ---
    findOrdersWithCategoryBreakdown(where) {
        return Order.findAll({
            where,
            include: [{
                model: OrderItem,
                as: 'details',
                include: [{
                    model: Product,
                    as: 'produit',
                    include: [{ model: Category, as: 'categorie' }],
                }],
            }],
        });
    },

    findPaidOrderAddresses(start, end) {
        return Order.findAll({
            where: { statut: 'payé', created_at: { [Op.between]: [start, end] } },
            attributes: ['adresse_livraison'],
            raw: true,
        });
    },

    // --- AI logs ---
    findRecentOrdersForLogs(limit = 5) {
        return Order.findAll({
            limit,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'statut', 'total_ttc', 'adresse_livraison'],
        });
    },

    findRecentDisputesForLogs(limit = 2) {
        return Litige.findAll({
            limit,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'statut'],
        });
    },
};

module.exports = dashboardRepository;
