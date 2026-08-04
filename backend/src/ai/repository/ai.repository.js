const { Op, Sequelize } = require('sequelize');
const {
    Order, OrderItem, Wallet, User, Product, Category, Store, AiConversation, AiMessage, Review, sequelize,
} = require('../../models');

const aiRepository = {
    findStoreByOwner(ownerId) {
        return Store.findOne({ where: { proprietaire_id: ownerId } });
    },

    findTopSellingProductsForStore(storeId) {
        return OrderItem.findAll({
            attributes: [
                'produit_id',
                [sequelize.fn('SUM', sequelize.col('quantite')), 'total_vendu'],
                [sequelize.fn('SUM', sequelize.literal('quantite * prix_unitaire_achat')), 'revenu_total'],
            ],
            include: [{
                model: Product,
                as: 'produit',
                where: { boutique_id: storeId },
                attributes: ['nom_produit', 'prix_unitaire', 'stock_quantite'],
            }],
            group: ['OrderItem.produit_id', 'produit.id'],
            order: [[sequelize.literal('total_vendu'), 'DESC']],
            limit: 10,
        });
    },

    countOrdersByStatus(utilisateur_id, statut) {
        return Order.count({ where: { utilisateur_id, statut } });
    },

    findConversationById(id, userId) {
        return AiConversation.findOne({ where: { id, user_id: userId } });
    },

    createConversation(userId, titre) {
        return AiConversation.create({ user_id: userId, titre });
    },

    findMessagesByConversation(conversationId, { order, limit } = {}) {
        const options = { where: { conversation_id: conversationId } };
        if (order) options.order = [['createdAt', order]];
        if (limit) options.limit = limit;
        return AiMessage.findAll(options);
    },

    createMessage(conversationId, role, contenu) {
        return AiMessage.create({ conversation_id: conversationId, role, contenu });
    },

    findConversationsByUser(userId, limit = 50) {
        return AiConversation.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            limit,
        });
    },

    findMessagesByConversationIds(ids) {
        return ids.length ? AiMessage.findAll({
            where: { conversation_id: { [Op.in]: ids } },
            order: [['createdAt', 'DESC']],
            raw: true,
        }) : Promise.resolve([]);
    },

    destroyMessagesByConversation(conversationId) {
        return AiMessage.destroy({ where: { conversation_id: conversationId } });
    },

    destroyConversation(conversation) {
        return conversation.destroy();
    },

    findLastOrdersForUser(userId, limit = 3) {
        return Order.findAll({
            where: { utilisateur_id: userId },
            limit,
            order: [['created_at', 'DESC']],
            include: [{ model: OrderItem, as: 'details' }],
        });
    },

    findWalletByUserId(userId) {
        return Wallet.findOne({ where: { user_id: userId } });
    },

    findUserById(userId) {
        return User.findByPk(userId);
    },

    findStoresByConditions(where, limit = 10) {
        return Store.findAll({
            where,
            attributes: ['id', 'nom_boutique', 'slug', 'description', 'logo_url', 'is_verified'],
            limit,
        });
    },

    findReviewRatingsForStores(storeIds) {
        return storeIds.length ? Review.findAll({
            attributes: [
                [Sequelize.col('Product.boutique_id'), 'boutique_id'],
                [Sequelize.fn('AVG', Sequelize.col('Review.note')), 'avg_note'],
                [Sequelize.fn('COUNT', Sequelize.col('Review.id')), 'nb_avis'],
            ],
            include: [{ model: Product, attributes: [], where: { boutique_id: { [Op.in]: storeIds } } }],
            group: ['Product.boutique_id'],
            raw: true,
        }) : Promise.resolve([]);
    },

    findProductsForSearch(where, limit = 20) {
        return Product.findAll({
            where,
            include: [
                { model: Store, as: 'boutique', attributes: ['nom_boutique', 'is_verified'] },
                { model: Category, as: 'categorie', attributes: ['nom_categorie'] },
            ],
            limit,
        });
    },

    findProductsSimple(where, limit = 10) {
        return Product.findAll({ where, limit });
    },

    findCategoriesByConditions(where) {
        return Category.findAll({ where, attributes: ['id'] });
    },

    getProductDialect() {
        return Product.sequelize.getDialect();
    },
};

module.exports = aiRepository;
