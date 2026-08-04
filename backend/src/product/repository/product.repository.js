const { Sequelize } = require('sequelize');
const Product = require('../models/product.model');
const { ProductImage, Category, Store, Review } = require('../../models');

const IMAGES_INCLUDE = { model: ProductImage, as: 'images', attributes: ['id', 'url_image', 'ordre'], order: [['ordre', 'ASC']] };

const productRepository = {
    IMAGES_INCLUDE,

    findById(id) {
        return Product.findByPk(id);
    },

    findCategoryById(id) {
        return Category.findByPk(id);
    },

    findStoreByOwner(ownerId) {
        return Store.findOne({ where: { proprietaire_id: ownerId } });
    },

    findFirstStore() {
        return Store.findOne();
    },

    // Utilisés par la mise en place de commande (feature `order`) pour verrouiller
    // le stock d'un produit pendant la transaction d'achat.
    findByIdForUpdate(id, transaction) {
        return Product.findByPk(id, { lock: transaction?.LOCK?.UPDATE, transaction });
    },

    incrementStock(productId, qty, transaction) {
        return Product.increment('stock_quantite', { by: qty, where: { id: productId }, transaction });
    },

    decrementStockInstance(product, qty, transaction) {
        return product.decrement('stock_quantite', { by: qty, transaction });
    },

    getStoreForProduct(product, transaction) {
        return product.getBoutique({ transaction });
    },

    countByStoreId(storeId) {
        return Product.count({ where: { boutique_id: storeId } });
    },

    destroyImages(produitId) {
        return ProductImage.destroy({ where: { produit_id: produitId } });
    },

    bulkCreateImages(rows) {
        return ProductImage.bulkCreate(rows);
    },

    create(data) {
        return Product.create(data);
    },

    findByIdWithCategoryAndImages(id) {
        return Product.findByPk(id, {
            include: [{ model: Category, as: 'categorie', attributes: ['nom_categorie'] }, IMAGES_INCLUDE]
        });
    },

    findAndCountAllFiltered({ where, order, limit, offset, isVerifiedOnly }) {
        return Product.findAndCountAll({
            where,
            include: [
                {
                    model: Store,
                    as: 'boutique',
                    attributes: ['nom_boutique', 'slug', 'id', 'logo_url', 'is_verified', 'proprietaire_id'],
                    where: isVerifiedOnly ? { is_verified: true } : {}
                },
                { model: Category, as: 'categorie', attributes: ['nom_categorie'] },
                { model: Review, as: 'avis', attributes: ['note'] },
                IMAGES_INCLUDE,
            ],
            order,
            limit,
            offset,
            distinct: true,
        });
    },

    findAllByStoreId(storeId) {
        return Product.findAll({
            where: { boutique_id: storeId },
            include: [
                { model: Store, as: 'boutique', attributes: ['nom_boutique', 'slug', 'id'] },
                { model: Category, as: 'categorie', attributes: ['nom_categorie'] },
                { model: Review, as: 'avis', attributes: ['note', 'commentaire', 'utilisateur_id', 'created_at', 'ia_sentiment'] },
                IMAGES_INCLUDE,
            ],
            order: [['createdAt', 'DESC']]
        });
    },

    findByIdFull(id) {
        return Product.findByPk(id, {
            include: [
                { model: Category, as: 'categorie' },
                {
                    model: Store,
                    as: 'boutique',
                    attributes: [
                        'nom_boutique', 'slug', 'id', 'proprietaire_id', 'logo_url',
                        'is_verified', 'localisation', 'temps_reponse', 'createdAt',
                    ],
                },
                { model: Review, as: 'avis', attributes: ['note', 'commentaire', 'utilisateur_id', 'created_at', 'ia_sentiment'] },
                IMAGES_INCLUDE,
            ]
        });
    },

    findStoreRatingAgg(storeId) {
        return Review.findOne({
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('Review.note')), 'avg_note'],
                [Sequelize.fn('COUNT', Sequelize.col('Review.id')), 'nb_avis'],
            ],
            include: [{ model: Product, attributes: [], where: { boutique_id: storeId } }],
            raw: true,
        });
    },

    findByIdWithStore(id) {
        return Product.findByPk(id, { include: [{ model: Store, as: 'boutique' }] });
    },

    findByIdWithStoreAndImages(id) {
        return Product.findByPk(id, { include: [{ model: Store, as: 'boutique' }, IMAGES_INCLUDE] });
    },

    updateInstance(product, data) {
        return product.update(data);
    },

    // Utilisé par la feature `product-variant` pour synchroniser le drapeau
    // has_variants sans recharger l'instance complète.
    setHasVariants(productId, hasVariants) {
        return Product.update({ has_variants: hasVariants }, { where: { id: productId } });
    },

    destroy(product) {
        return product.destroy();
    },
};

module.exports = productRepository;
