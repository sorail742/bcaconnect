const cron = require('node-cron');
const { Product, Store, User, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

const LOW_STOCK_THRESHOLD = 5;

const notifyOwner = async (io, ownerId, titre, message) => {
    const notif = await Notification.create({
        utilisateur_id: ownerId,
        titre,
        message,
        type: 'system',
    });
    if (io) io.to(ownerId).emit('notification_received', notif);
};

/**
 * Parcourt les produits : réapprovisionne automatiquement ceux configurés
 * pour ça (reappro_auto_actif) une fois sous leur propre seuil, et envoie une
 * simple alerte pour les autres produits sous le seuil global par défaut.
 */
const runStockAlerts = async (io = null) => {
    try {
        console.log("📦 Début du job d'alerte de stock...");

        const candidates = await Product.findAll({
            where: {
                [Op.or]: [
                    { stock_quantite: { [Op.lte]: LOW_STOCK_THRESHOLD } },
                    {
                        reappro_auto_actif: true,
                        reappro_seuil: { [Op.ne]: null },
                        stock_quantite: { [Op.lte]: sequelize.col('reappro_seuil') },
                    },
                ],
            },
            include: [{
                model: Store,
                as: 'boutique',
                include: [{ model: User }],
            }],
        });

        let alertsSent = 0;
        let autoReplenished = 0;

        for (const product of candidates) {
            const ownerId = product.boutique?.proprietaire_id;
            if (!ownerId) continue;

            const seuil = product.reappro_seuil ?? LOW_STOCK_THRESHOLD;
            const eligibleForAutoReplenish = product.reappro_auto_actif
                && product.reappro_quantite > 0
                && product.stock_quantite <= seuil;

            if (eligibleForAutoReplenish) {
                const previousStock = product.stock_quantite;
                await product.update({
                    stock_quantite: previousStock + product.reappro_quantite,
                    reappro_derniere_execution: new Date(),
                });

                await notifyOwner(io, ownerId, 'Réapprovisionnement automatique effectué',
                    `<span class="font-bold">${product.nom_produit}</span> était à <span class="font-black text-amber-600">${previousStock}</span> unités (seuil : ${seuil}) — stock automatiquement porté à <span class="font-black text-emerald-600">${product.stock_quantite}</span>.`);

                autoReplenished++;
                continue;
            }

            if (product.stock_quantite <= LOW_STOCK_THRESHOLD) {
                await notifyOwner(io, ownerId, 'Alerte de Stock Bas',
                    `Le produit <span class="font-bold">${product.nom_produit}</span> n'a plus que <span class="font-black text-red-500">${product.stock_quantite}</span> unités en stock. Pensez à réapprovisionner.`);
                alertsSent++;
            }
        }

        console.log(`✅ Fin du job d'alerte de stock. ${alertsSent} alertes, ${autoReplenished} réapprovisionnements automatiques.`);
    } catch (error) {
        console.error("❌ Erreur lors du job d'alerte de stock :", error);
    }
};

const startStockAlerts = (io) => {
    // Exécution tous les jours à 08h00
    cron.schedule('0 8 * * *', () => {
        runStockAlerts(io);
    });
    console.log("⏰ Cron job 'Stock Alerts' programmé (Quotidien 08:00)");
};

module.exports = { startStockAlerts, runStockAlerts };
