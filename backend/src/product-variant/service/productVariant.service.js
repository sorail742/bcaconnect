const AppError = require('../../utils/AppError');
const productVariantRepository = require('../repository/productVariant.repository');

const isProductOwner = async (produitId, userId) => {
    const product = await productVariantRepository.findProductWithStore(produitId);
    return !!product && product.boutique?.proprietaire_id === userId;
};

const productVariantService = {
    async getForProduct(productId) {
        return productVariantRepository.findAllForProduct(productId);
    },

    async create(productId, { nom_variante, attributs, prix_unitaire, stock_quantite, sku, image_url }, user) {
        if (!nom_variante?.trim()) throw new AppError('Le nom de la variante est requis.', 400);
        if (stock_quantite === undefined || Number(stock_quantite) < 0) {
            throw new AppError('Le stock de la variante doit être un nombre positif.', 400);
        }

        const product = await productVariantRepository.findProductWithStore(productId);
        if (!product) throw new AppError('Produit introuvable.', 404);

        const isAdmin = user.role === 'admin';
        const isOwner = isAdmin || product.boutique?.proprietaire_id === user.id;
        if (!isOwner) throw new AppError('Non autorisé.', 403);

        const variant = await productVariantRepository.create({
            produit_id: productId,
            nom_variante: nom_variante.trim(),
            attributs: attributs || {},
            prix_unitaire: prix_unitaire !== undefined && prix_unitaire !== '' ? Number(prix_unitaire) : null,
            stock_quantite: Number(stock_quantite),
            sku: sku?.trim() || null,
            image_url: image_url || null,
        });

        if (!product.has_variants) {
            await productVariantRepository.saveProduct(product);
        }

        return variant;
    },

    async update(id, { nom_variante, attributs, prix_unitaire, stock_quantite, sku, image_url, actif }, user) {
        const variant = await productVariantRepository.findById(id);
        if (!variant) throw new AppError('Variante introuvable.', 404);

        const isAdmin = user.role === 'admin';
        const isOwner = isAdmin || await isProductOwner(variant.produit_id, user.id);
        if (!isOwner) throw new AppError('Non autorisé.', 403);

        if (nom_variante !== undefined) variant.nom_variante = nom_variante.trim();
        if (attributs !== undefined) variant.attributs = attributs;
        if (prix_unitaire !== undefined) variant.prix_unitaire = prix_unitaire === '' ? null : Number(prix_unitaire);
        if (stock_quantite !== undefined) variant.stock_quantite = Number(stock_quantite);
        if (sku !== undefined) variant.sku = sku?.trim() || null;
        if (image_url !== undefined) variant.image_url = image_url || null;
        if (actif !== undefined) variant.actif = Boolean(actif);
        await productVariantRepository.save(variant);

        return variant;
    },

    async remove(id, user) {
        const variant = await productVariantRepository.findById(id);
        if (!variant) throw new AppError('Variante introuvable.', 404);

        const isAdmin = user.role === 'admin';
        const isOwner = isAdmin || await isProductOwner(variant.produit_id, user.id);
        if (!isOwner) throw new AppError('Non autorisé.', 403);

        const produitId = variant.produit_id;
        await productVariantRepository.destroy(variant);

        const remaining = await productVariantRepository.countForProduct(produitId);
        if (remaining === 0) {
            await productVariantRepository.clearProductHasVariants(produitId);
        }
    },
};

module.exports = productVariantService;
