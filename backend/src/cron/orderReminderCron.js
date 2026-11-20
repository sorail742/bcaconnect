const cron = require('node-cron');
const { Op } = require('sequelize');
const { Order, Notification, User, OrderItem } = require('../models');
const { emitOrderStatusUpdate } = require('../utils/orderSocketEvents');

/**
 * Tâche Cron : Rappels automatiques pour les commandes (paiements et relances vendeurs)
 * S'exécute tous les jours à 09:00 (0 9 * * *)
 */
const startOrderReminders = (io) => {
    cron.schedule('0 9 * * *', async () => {
        console.log('[CRON] Lancement de la vérification des commandes en attente/retard...');
        
        try {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

            // 1. Relance 24h pour les commandes en attente de paiement
            const ordersToRemind = await Order.findAll({
                where: {
                    statut: 'en_attente_paiement',
                    created_at: {
                        [Op.lte]: yesterday,
                        [Op.gt]: twoDaysAgo // Entre 24h et 48h
                    }
                }
            });

            for (const order of ordersToRemind) {
                const notif = await Notification.create({
                    utilisateur_id: order.utilisateur_id,
                    titre: 'Paiement en attente',
                    message: `Votre commande #${order.id.slice(0,8)} est toujours en attente de paiement. Elle sera automatiquement annulée d'ici 24h.`,
                    type: 'payment',
                    metadata: { order_id: order.id }
                });
                if (io) io.to(order.utilisateur_id).emit('notification_received', notif);
            }

            // 2. Annulation automatique 48h pour les commandes non payées
            const ordersToCancel = await Order.findAll({
                where: {
                    statut: 'en_attente_paiement',
                    created_at: {
                        [Op.lte]: twoDaysAgo
                    }
                }
            });

            for (const order of ordersToCancel) {
                // Order.statut utilise 'annulé' (avec accent) partout ailleurs
                // (orderController.js) — 'annule' ici romprait silencieusement les
                // comparaisons strictes côté contrôleur et frontend.
                order.statut = 'annulé';
                await order.save();

                const notif = await Notification.create({
                    utilisateur_id: order.utilisateur_id,
                    titre: 'Commande annulée',
                    message: `Votre commande #${order.id.slice(0,8)} a été annulée car le délai de paiement de 48h a expiré.`,
                    type: 'order',
                    metadata: { order_id: order.id }
                });
                if (io) {
                    io.to(order.utilisateur_id).emit('notification_received', notif);
                    await emitOrderStatusUpdate(io, order);
                }
            }

            // 3. Relance vendeurs : commandes payées non préparées depuis 48h
            // On cherche les OrderItems qui sont 'en_attente' alors que la commande a été passée il y a > 48h
            const lateItems = await OrderItem.findAll({
                where: {
                    statut: 'en_attente',
                    created_at: {
                        [Op.lte]: twoDaysAgo
                    }
                },
                include: [{
                    model: Order,
                    as: 'commande',
                    where: {
                        statut: { [Op.in]: ['payé', 'paye'] }
                    }
                }]
            });

            const vendorAlerts = {};
            for (const item of lateItems) {
                if (!item.fournisseur_id) continue;
                if (!vendorAlerts[item.fournisseur_id]) vendorAlerts[item.fournisseur_id] = [];
                vendorAlerts[item.fournisseur_id].push(item);
            }

            for (const [vendorId, items] of Object.entries(vendorAlerts)) {
                const notif = await Notification.create({
                    utilisateur_id: vendorId,
                    titre: 'Préparation en retard',
                    message: `Vous avez ${items.length} article(s) à préparer qui ont dépassé le délai de 48h. Veuillez traiter ces expéditions rapidement.`,
                    type: 'system'
                });
                if (io) io.to(vendorId).emit('notification_received', notif);
            }

            console.log(`[CRON] Vérification des commandes terminée. (Rappels: ${ordersToRemind.length}, Annulations: ${ordersToCancel.length})`);

        } catch (error) {
            console.error('[CRON] Erreur lors de la vérification des commandes :', error);
        }
    });
    console.log('[CRON] Tâche de relance des commandes planifiée (Tous les jours à 09:00).');
};

module.exports = { startOrderReminders };
