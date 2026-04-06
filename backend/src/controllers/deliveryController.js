const { Order, OrderItem, Wallet, Transaction, User, DeliveryLog, sequelize } = require('../models');
const { Op } = require('sequelize');

const deliveryController = {
    // 1. Lister les commandes disponibles pour ramassage
    getAvailableOrders: async (req, res, next) => {
        try {
            const orders = await Order.findAll({
                where: {
                    statut_livraison: 'pret',
                    statut: { [Op.in]: ['payé', 'en_préparation'] }
                },
                include: ['details']
            });
            res.json(orders);
        } catch (error) {
            next(error);
        }
    },

    // 2. Accepter une livraison + Générer OTP
    assignOrder: async (req, res, next) => {
        try {
            const { orderId } = req.body;
            const transporteur_id = req.user.id;

            const order = await Order.findByPk(orderId);
            if (!order || order.statut_livraison !== 'pret') {
                return res.status(400).json({ message: "Commande non disponible." });
            }

            // Générer un OTP de 6 chiffres pour la livraison
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            order.transporteur_id = transporteur_id;
            order.statut_livraison = 'ramasse';
            order.delivery_otp = otp;
            await order.save();

            // Créer le log initial
            await DeliveryLog.create({
                order_id: orderId,
                statut: 'ramasse',
                commentaire: 'Colis récupéré chez le marchand'
            });

            res.json({
                message: "Commande assignée. Le code OTP a été envoyé au client.",
                order_otp: otp // Normalement envoyé par SMS/Notification, ici renvoyé pour test
            });
        } catch (error) {
            next(error);
        }
    },

    // 3. Mise à jour de la position GPS & Statut (Live Tracking)
    updateTracking: async (req, res, next) => {
        try {
            const { orderId, latitude, longitude, status, commentaire } = req.body;

            const log = await DeliveryLog.create({
                order_id: orderId,
                latitude,
                longitude,
                statut: status || 'en_cours',
                commentaire
            });

            if (status) {
                await Order.update({ statut_livraison: status }, { where: { id: orderId } });
            }

            res.json({ message: "Position et statut mis à jour", log });
        } catch (error) {
            next(error);
        }
    },

    // 4. Finaliser la livraison avec vérification OTP
    verifyDelivery: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { orderId, otp } = req.body;
            const transporteur_id = req.user.id;

            const order = await Order.findByPk(orderId, {
                transaction: t,
                include: [{ model: OrderItem, as: 'details' }]
            });

            if (!order || order.transporteur_id !== transporteur_id) {
                await t.rollback();
                return res.status(403).json({ message: "Action non autorisée." });
            }

            if (order.delivery_otp !== otp) {
                await t.rollback();
                return res.status(400).json({ message: "Code OTP incorrect. Livraison non validée." });
            }

            order.statut_livraison = 'livre';
            order.delivery_otp = null; // Clear OTP après usage
            await order.save({ transaction: t });

            // LOGIQUE FINANCIÈRE : Libération des fonds (reprise du code existant)
            for (const item of order.details) {
                const vendorWallet = await Wallet.findOne({ where: { user_id: item.fournisseur_id }, transaction: t });
                if (vendorWallet) {
                    const amount = parseFloat(item.prix_unitaire_achat) * item.quantite;
                    vendorWallet.solde_sequestre = Math.max(0, parseFloat(vendorWallet.solde_sequestre) - amount);
                    vendorWallet.solde_virtuel = parseFloat(vendorWallet.solde_virtuel) + amount;
                    await vendorWallet.save({ transaction: t });

                    await Transaction.create({
                        portefeuille_id: vendorWallet.id,
                        commande_id: order.id,
                        montant: amount,
                        type_transaction: 'achat',
                        statut: 'complete',
                        reference_externe: `REL-${order.id.slice(0, 8)}`,
                        metadata: { type: 'release_escrow' }
                    }, { transaction: t });
                }
            }

            await DeliveryLog.create({
                order_id: orderId,
                statut: 'livre',
                commentaire: 'Livraison finalisée et validée par OTP'
            }, { transaction: t });

            await t.commit();
            res.json({ message: "Livraison réussie et validée !", order });
        } catch (error) {
            if (t) await t.rollback();
            next(error);
        }
    },

    // 5. Récupérer l'historique de tracking (Client)
    getTrackingHistory: async (req, res, next) => {
        try {
            const { orderId } = req.params;
            const history = await DeliveryLog.findAll({
                where: { order_id: orderId },
                order: [['created_at', 'ASC']]
            });
            res.json(history);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = deliveryController;
