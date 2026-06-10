const { User, Notification, Order, OrderItem } = require('../models');
const { isCarrierPickupEligible } = require('../utils/deliveryEligibility');

/**
 * Passe la commande en « pret » si tous les articles sont préparés.
 */
async function syncOrderReadyForPickup(orderId, transaction) {
    const allItems = await OrderItem.findAll({
        where: { commande_id: orderId },
        transaction,
    });
    if (!allItems.length) return { ready: false };

    const allPrepared = allItems.every((i) => i.statut === 'prepare' || i.statut === 'livre');
    if (!allPrepared) return { ready: false };

    const statut_livraison = allItems.every((i) => i.statut === 'livre') ? 'livre' : 'pret';
    await Order.update(
        { statut_livraison },
        { where: { id: orderId }, transaction },
    );
    return { ready: statut_livraison === 'pret' };
}

/**
 * Notifie tous les transporteurs qu'une commande est disponible.
 */
async function notifyCarriersOrderReady(app, order) {
    if (!isCarrierPickupEligible(order)) return;

    const io = app?.get?.('socketio');
    const carriers = await User.findAll({
        where: { role: 'transporteur' },
        attributes: ['id', 'statut'],
    });

    for (const carrier of carriers) {
        try {
            const carrierNotif = await Notification.create({
                utilisateur_id: carrier.id,
                titre: 'Nouvelle livraison disponible',
                message: `Commande <span class="font-black text-primary">#${order.id.slice(0, 8)}</span> prête à ramasser — ${parseFloat(order.frais_port || 0).toLocaleString('fr-GN')} GNF`,
                type: 'delivery',
                metadata: { order_id: order.id },
            });
            if (io) {
                io.to(carrier.id).emit('notification_received', carrierNotif);
            }
        } catch (err) {
            console.warn(`[delivery] Notification transporteur ${carrier.id}:`, err.message);
        }
        if (io) {
            io.to(carrier.id).emit('delivery_available', {
                orderId: order.id,
                frais_port: order.frais_port,
                adresse: order.adresse_livraison,
            });
        }
    }
}

/**
 * Aligne statut_livraison global selon les statuts articles.
 */
async function syncOrderLogisticsFromItems(orderId, transaction) {
    const items = await OrderItem.findAll({
        where: { commande_id: orderId },
        transaction,
    });
    if (!items.length) return;

    const active = items.filter((i) => i.statut !== 'annule');
    if (!active.length) return;

    if (active.every((i) => i.statut === 'livre')) {
        await Order.update({ statut_livraison: 'livre' }, { where: { id: orderId }, transaction });
        return;
    }

    const allPrepared = active.every((i) => ['prepare', 'expedie', 'livre'].includes(i.statut));
    if (allPrepared && active.every((i) => i.statut === 'prepare')) {
        await Order.update({ statut_livraison: 'pret' }, { where: { id: orderId }, transaction });
        return { readyForCarrier: true };
    }

    const allShipped = active.every((i) => ['expedie', 'livre'].includes(i.statut));
    if (allShipped) {
        const order = await Order.findByPk(orderId, { transaction });
        if (order?.transporteur_id && order.statut_livraison !== 'livre') {
            await Order.update(
                { statut_livraison: 'en_route' },
                { where: { id: orderId }, transaction },
            );
        }
    }
}

module.exports = {
    syncOrderReadyForPickup,
    syncOrderLogisticsFromItems,
    notifyCarriersOrderReady,
};
