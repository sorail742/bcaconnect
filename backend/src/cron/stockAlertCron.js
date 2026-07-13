const cron = require('node-cron');
const { Product, Store, User, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

const LOW_STOCK_THRESHOLD = 5;

/**
 * Parcourt les produits et envoie une alerte au fournisseur si le stock est en dessous du seuil.
 */
const runStockAlerts = async (io = null) => {
    try {
        console.log("📦 Début du job d'alerte de stock...");

        // On cherche les produits actifs avec un stock <= LOW_STOCK_THRESHOLD
        const lowStockProducts = await Product.findAll({
            where: {
                stock_quantite: { [Op.lte]: LOW_STOCK_THRESHOLD },
            },
            include: [{
                model: Store,
                as: 'boutique', // Vérifier l'alias si nécessaire
                include: [{
                    model: User
                }]
            }]
        });

        let alertsSent = 0;

        for (const product of lowStockProducts) {
            // Identifier le propriétaire de la boutique
            const ownerId = product.boutique?.proprietaire_id;

            if (ownerId) {
                // Créer une notification
                const notif = await Notification.create({
                    utilisateur_id: ownerId,
                    titre: 'Alerte de Stock Bas',
                    message: `Le produit <span class="font-bold">${product.nom_produit}</span> n'a plus que <span class="font-black text-red-500">${product.stock_quantite}</span> unités en stock. Pensez à réapprovisionner.`,
                    type: 'system'
                });

                // Émettre en temps réel si io est disponible
                if (io) {
                    io.to(ownerId).emit('notification_received', notif);
                }
                
                alertsSent++;
            }
        }

        console.log(`✅ Fin du job d'alerte de stock. ${alertsSent} alertes générées.`);
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
