const ProductQuestion = require('../models/productQuestion.model');
const { Product, Store, User, Notification } = require('../../models');
const productRepository = require('../../product/repository/product.repository');

const authorInclude = { model: User, as: 'auteur', attributes: ['id', 'nom_complet'] };
const respondentInclude = { model: User, as: 'repondant', attributes: ['id', 'nom_complet'] };

const productQuestionRepository = {
    findVisibleForProduct(productId) {
        return ProductQuestion.findAll({
            where: { produit_id: productId, visible: true },
            include: [authorInclude, respondentInclude],
            order: [['createdAt', 'DESC']],
        });
    },

    create(data) {
        return ProductQuestion.create(data);
    },

    findById(id) {
        return ProductQuestion.findByPk(id);
    },

    findByIdWithAuthorRespondent(id) {
        return ProductQuestion.findByPk(id, { include: [authorInclude, respondentInclude] });
    },

    save(question) {
        return question.save();
    },

    destroy(question) {
        return question.destroy();
    },

    async findPendingForVendor(userId) {
        const stores = await Store.findAll({ where: { proprietaire_id: userId }, attributes: ['id'] });
        const products = await Product.findAll({ where: { boutique_id: stores.map((s) => s.id) }, attributes: ['id'] });
        return ProductQuestion.findAll({
            where: { produit_id: products.map((p) => p.id), reponse: null },
            include: [authorInclude, { model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'image_url'] }],
            order: [['createdAt', 'ASC']],
        });
    },

    // ── Traversées vers la feature `product` (déjà migrée) ─────────────
    findProductWithStore(productId) {
        return productRepository.findByIdWithStore(productId);
    },

    createNotification(data) {
        return Notification.create(data);
    },
};

module.exports = productQuestionRepository;
