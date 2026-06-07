const { Product } = require('../models');
const AppError = require('../utils/AppError');

/** Réserve le stock pour les lignes de commande (Phase 1 — intégrité inventaire). */
async function reserveStockForItems(items, transaction) {
    for (const item of items) {
        const qty = item.quantite ?? item.quantity;
        const productId = item.produit_id ?? item.productId ?? item.id;
        if (!productId || !qty) continue;

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
