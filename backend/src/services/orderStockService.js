const { Product, ProductVariant } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Réserve le stock pour les lignes de commande (Phase 1 — intégrité inventaire).
 * Si `variante_id` est présent sur une ligne, le stock est décrémenté sur la
 * variante (pas sur le produit parent) — un produit sans variantes n'est
 * jamais affecté par ce chemin, comportement inchangé.
 */
async function reserveStockForItems(items, transaction) {
    for (const item of items) {
        const qty = item.quantite ?? item.quantity;
        const productId = item.produit_id ?? item.productId ?? item.id;
        const variantId = item.variante_id ?? item.variantId ?? null;
        if (!productId || !qty) continue;

        if (variantId) {
            const variant = await ProductVariant.findByPk(variantId, {
                lock: transaction.LOCK.UPDATE,
                transaction,
            });
            if (!variant || variant.produit_id !== productId) {
                throw new AppError('Variante introuvable pour ce produit.', 404);
            }
            if (variant.stock_quantite < qty) {
                throw new AppError(`Stock insuffisant pour la variante "${variant.nom_variante}".`, 400);
            }
            await variant.decrement('stock_quantite', { by: qty, transaction });
            continue;
        }

        const product = await Product.findByPk(productId, {
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        if (!product) {
            throw new AppError(`Produit ${productId} introuvable.`, 404);
        }
        if (product.stock_quantite < qty) {
            throw new AppError(`Stock insuffisant: ${product.nom_produit}.`, 400);
        }
        await product.decrement('stock_quantite', { by: qty, transaction });
    }
}

module.exports = { reserveStockForItems };
