const ProductVariant = require('../models/productVariant.model');
const productRepository = require('../../product/repository/product.repository');

const productVariantRepository = {
    findAllForProduct(productId) {
        return ProductVariant.findAll({
            where: { produit_id: productId },
            order: [['createdAt', 'ASC']],
        });
    },

    create(data) {
        return ProductVariant.create(data);
    },

    findById(id) {
        return ProductVariant.findByPk(id);
    },

    save(variant) {
        return variant.save();
    },

    destroy(variant) {
        return variant.destroy();
    },

    countForProduct(productId) {
        return ProductVariant.count({ where: { produit_id: productId } });
    },

    // ── Traversées vers la feature `product` (déjà migrée) ─────────────
    findProductWithStore(productId) {
        return productRepository.findByIdWithStore(productId);
    },

    saveProduct(product) {
        return productRepository.updateInstance(product, { has_variants: true });
    },

    clearProductHasVariants(productId) {
        return productRepository.setHasVariants(productId, false);
    },
};

module.exports = productVariantRepository;
