const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const Store = require('../models/store.model');
const { User, Product, Category, Review, Order, OrderItem } = require('../../models');

const storeRepository = {
    findById(id, { transaction } = {}) {
        return Store.findOne({ where: { id }, transaction });
    },

    findByOwnerId(ownerId, { transaction } = {}) {
        return Store.findOne({ where: { proprietaire_id: ownerId }, transaction });
    },

    findByOwnerIdForUpdate(ownerId, transaction) {
        return Store.findOne({
            where: { proprietaire_id: ownerId },
            transaction,
            lock: transaction?.LOCK?.UPDATE,
        });
    },

    findByOwnerIdWithProducts(ownerId) {
        return Store.findOne({
            where: { proprietaire_id: ownerId },
            include: [{
                model: Product,
                as: 'produits',
                include: [{ model: Category, as: 'categorie', attributes: ['nom_categorie'] }]
            }]
        });
    },

    findAllFiltered({ search, category, verified } = {}) {
        const where = { statut: 'actif' };

        if (search) {
            where[Op.or] = [
                { nom_boutique: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (category && category !== 'all') {
            where.categorie_principale = category;
        }
        if (verified === 'true') {
            where.is_verified = true;
        }

        return Store.findAll({
            where,
            include: [
                { model: User, attributes: ['nom_complet'] },
                {
                    model: Product,
                    as: 'produits',
                    limit: 4,
                    order: [['createdAt', 'DESC']],
                    attributes: ['id', 'nom_produit', 'image_url', 'prix_unitaire']
                }
            ]
        });
    },

    findRatingsForStores(storeIds) {
        if (!storeIds.length) return Promise.resolve([]);
        return Review.findAll({
            attributes: [
                [sequelize.col('Product.boutique_id'), 'boutique_id'],
                [sequelize.fn('AVG', sequelize.col('Review.note')), 'avg_note'],
                [sequelize.fn('COUNT', sequelize.col('Review.id')), 'nb_avis'],
            ],
            include: [{ model: Product, attributes: [], where: { boutique_id: { [Op.in]: storeIds } } }],
            group: ['Product.boutique_id'],
            raw: true,
        });
    },

    findByIdBasic(id) {
        return Store.findByPk(id, {
            include: ['produits', { model: User, attributes: ['nom_complet'] }]
        });
    },

    findBySlugFull(slug) {
        return Store.findOne({
            where: { slug },
            include: [
                {
                    model: Product,
                    as: 'produits',
                    include: [{ model: Category, as: 'categorie', attributes: ['nom_categorie'] }]
                },
                { model: User, attributes: ['nom_complet'] }
            ]
        });
    },

    findByIdFull(id) {
        return Store.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'produits',
                    include: [{ model: Category, as: 'categorie', attributes: ['nom_categorie'] }]
                },
                { model: User, attributes: ['nom_complet'] }
            ]
        });
    },

    findClientOrderItemsForStore(storeId) {
        return OrderItem.findAll({
            attributes: ['id'],
            include: [
                { model: Product, as: 'produit', attributes: ['id'], required: true, where: { boutique_id: storeId } },
                {
                    model: Order, as: 'commande', attributes: ['id'], required: true,
                    include: [{ model: User, as: 'client', attributes: ['id', 'nom_complet', 'adresse', 'avatar_url'] }],
                },
            ],
        });
    },

    create(data) {
        return Store.create(data);
    },

    updateInstance(store, data) {
        return store.update(data);
    },
};

module.exports = storeRepository;
