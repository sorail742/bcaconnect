const { Order, OrderItem } = require('../models');

/**
 * Notifie client, vendeur(s) et transporteur d'une mise à jour commande (temps réel).
 */
async function emitOrderStatusUpdate(io, orderOrId, extra = {}) {
    if (!io) return;

    const order = typeof orderOrId === 'string'
        ? await Order.findByPk(orderOrId, {
            attributes: ['id', 'utilisateur_id', 'transporteur_id', 'statut_livraison', 'statut'],
        })
        : orderOrId;
    if (!order) return;

    const payload = {
        orderId: order.id,
        statut: order.statut,
        statut_livraison: order.statut_livraison,
        transporteur_id: order.transporteur_id,
        ...extra,
    };

    io.to(order.utilisateur_id).emit('order_status_updated', payload);
    if (order.transporteur_id) {
        io.to(order.transporteur_id).emit('order_status_updated', payload);
    }

    const vendorRows = await OrderItem.findAll({
        where: { commande_id: order.id },
        attributes: ['fournisseur_id'],
    });
    const vendorIds = [...new Set(vendorRows.map((r) => r.fournisseur_id).filter(Boolean))];
    for (const vendorId of vendorIds) {
        io.to(vendorId).emit('order_status_updated', payload);
    }
}

module.exports = { emitOrderStatusUpdate };
