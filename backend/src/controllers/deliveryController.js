const { Order, OrderItem, Product, Wallet, Transaction, User, DeliveryLog, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const deliveryController = {
    // 1. Lister les commandes disponibles pour ramassage
    getAvailableOrders: catchAsync(async (req, res, next) => {
        const orders = await Order.findAll({
            where: {
                statut_livraison: 'pret',
                statut: { [Op.in]: ['payé', 'en_préparation'] }
            },
            include: ['details']
        });
        res.json(orders);
    }),

    // 2. Accepter une livraison + Générer OTP
    assignOrder: catchAsync(async (req, res, next) => {
        const { orderId } = req.body;
        const transporteur_id = req.user.id;

        const order = await Order.findByPk(orderId);
        if (!order || order.statut_livraison !== 'pret') {
            return next(new AppError("Commande non disponible.", 400));
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
    }),

    // 3. Mise à jour de la position GPS & Statut (Live Tracking)
    updateTracking: catchAsync(async (req, res, next) => {
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
    }),

    // 4. Finaliser la livraison avec vérification OTP
    verifyDelivery: catchAsync(async (req, res, next) => {
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
                return next(new AppError("Action non autorisée.", 403));
            }

            if (order.delivery_otp !== otp) {
                await t.rollback();
                return next(new AppError("Code OTP incorrect. Livraison non validée.", 400));
            }

            order.statut_livraison = 'livre';
            order.delivery_otp = null; // Clear OTP après usage
            await order.save({ transaction: t });

            // LOGIQUE FINANCIÈRE : Libération des fonds du séquestre vers le solde virtuel
            for (const item of order.details) {
                const vendorWallet = await Wallet.findOne({ 
                    where: { user_id: item.fournisseur_id }, 
                    transaction: t,
                    lock: t.LOCK.UPDATE 
                });
                
                if (vendorWallet) {
                    const amount = parseFloat(item.prix_unitaire_achat) * item.quantite;
                    
                    // Sécurité : Ne pas descendre en dessous de 0 pour le séquestre
                    if (parseFloat(vendorWallet.solde_sequestre) < amount) {
                        console.error(`⚠️ [ESCROW ERROR] Solde séquestre insuffisant pour le vendeur ${item.fournisseur_id}`);
                    }

                    vendorWallet.solde_sequestre = Math.max(0, parseFloat(vendorWallet.solde_sequestre) - amount);
                    vendorWallet.solde_virtuel = parseFloat(vendorWallet.solde_virtuel) + amount;
                    await vendorWallet.save({ transaction: t });

                    await Transaction.create({
                        portefeuille_id: vendorWallet.id,
                        commande_id: order.id,
                        montant: amount,
                        type_transaction: 'depot',
                        statut: 'complete',
                        reference_externe: `REL-${order.id.slice(0, 8)}`,
                        metadata: { type: 'release_escrow', description: 'Libération des fonds après livraison validée' }
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
    }),

    // 5. Récupérer les livraisons assignées au transporteur connecté
    getMyDeliveries: catchAsync(async (req, res, next) => {
        const transporteur_id = req.user.id;
        const history = await Order.findAll({
            where: {
                transporteur_id,
                statut_livraison: { [Op.ne]: 'livre' }
            },
            include: [
                {
                    model: OrderItem,
                    as: 'details',
                    include: [{ model: Product, as: 'produit' }]
                },
                {
                    model: User,
                    as: 'client',
                    attributes: ['nom_complet', 'telephone', 'email']
                }
            ],
            order: [['updated_at', 'DESC']]
        });
        res.json(history);
    }),

    // 6. Récupérer l'historique de tracking (Client)
    getTrackingHistory: catchAsync(async (req, res, next) => {
        const { orderId } = req.params;
        const history = await DeliveryLog.findAll({
            where: { order_id: orderId },
            order: [['created_at', 'ASC']]
        });
        res.json(history);
    })
};

module.exports = deliveryController;
