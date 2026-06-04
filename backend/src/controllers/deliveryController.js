const { Order, OrderItem, Product, Wallet, Transaction, User, DeliveryLog, DeliveryGroup, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const escrowService = require('../services/escrowService');

// ─── Utilitaire RGPD ─────────────────────────────────────────────────────────
// Masque un nom pour l'affichage public : "Jean Dupont" → "J*** D***"
const maskName = (name) => {
    if (!name) return '*** ***';
    return name.split(' ').map(part => {
        if (part.length <= 1) return part;
        return part[0] + '***';
    }).join(' ');
};

// Masque une adresse : "123 Rue Kakimbo, Conakry" → "***, Conakry"
const maskAddress = (address) => {
    if (!address) return '***';
    const parts = address.split(',');
    if (parts.length > 1) {
        return `***, ${parts.slice(1).join(',').trim()}`;
    }
    // Si pas de virgule, on garde seulement le dernier mot (ville presumée)
    const words = address.trim().split(' ');
    return `***, ${words[words.length - 1]}`;
};

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

        // Notifier le client avec le code OTP (canal in-app sécurisé)
        const io = req.app.get('socketio');
        const clientNotif = await Notification.create({
            utilisateur_id: order.utilisateur_id,
            titre: 'Code de livraison BCA',
            message: `Votre livreur a récupéré votre colis. Code OTP à remettre à la livraison : <span class="font-black text-primary tracking-widest">${otp}</span>`,
            type: 'delivery',
            metadata: { order_id: orderId, otp_hint: otp.slice(0, 2) + '****' }
        });
        if (io) {
            io.to(order.utilisateur_id).emit('notification_received', clientNotif);
        }

        res.json({
            message: "Commande assignée. Le code OTP a été envoyé au client.",
            order_otp: process.env.NODE_ENV === 'production' ? undefined : otp
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

        // UPDATE: Spatial tracking for the transport asset (carrier)
        if (req.user && latitude && longitude) {
            const point = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
            await User.update(
                { location: point },
                { where: { id: req.user.id } }
            );
        }

        // Push temps réel aux clients qui suivent cette commande
        const io = req.app.get('socketio');
        const order = await Order.findByPk(orderId, { attributes: ['id', 'utilisateur_id'] });
        if (io && order) {
            io.to(order.utilisateur_id).emit('delivery_tracking_update', {
                orderId,
                latitude,
                longitude,
                status: status || log.statut,
                timestamp: log.created_at
            });
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

            // LOGIQUE FINANCIÈRE : Libération idempotente via escrowService
            await escrowService.releaseOrderEscrow(orderId, order.details, t, 'release_escrow');

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
    }),

    // 7. Suivi PUBLIC par numéro de commande (sans authentification, données masquées RGPD)
    trackOrderPublic: catchAsync(async (req, res, next) => {
        const { trackingNumber } = req.params;

        // Normaliser : supprimer le préfixe "ORD-" si présent, et mettre en minuscules
        const cleanId = trackingNumber.replace(/^ORD-/i, '').toLowerCase().trim();

        if (!cleanId || cleanId.length < 6) {
            return next(new AppError("Numéro de suivi invalide. Format attendu : ORD-XXXXXXXX ou les 8 premiers caractères de l'identifiant.", 400));
        }

        // Recherche par les premiers caractères de l'UUID
        const order = await Order.findOne({
            where: {
                id: { [Op.like]: `${cleanId}%` }
            }
        });

        if (!order) {
            return next(new AppError("Aucune expédition trouvée pour ce numéro de suivi.", 404));
        }

        // Récupérer l'historique de livraison
        const history = await DeliveryLog.findAll({
            where: { order_id: order.id },
            order: [['created_at', 'ASC']]
        });

        // Dernière position GPS connue
        const gpsLogs = history.filter(h => h.latitude != null && h.longitude != null);
        const lastPosition = gpsLogs.length > 0
            ? {
                latitude: parseFloat(gpsLogs[gpsLogs.length - 1].latitude),
                longitude: parseFloat(gpsLogs[gpsLogs.length - 1].longitude),
                updated_at: gpsLogs[gpsLogs.length - 1].created_at
            }
            : null;

        // ─── Masquage RGPD : protéger les données personnelles ─────────────────
        const publicData = {
            id: order.id,
            trackingRef: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
            statut: order.statut,
            statut_livraison: order.statut_livraison,
            date_commande: order.date_commande,
            // Données masquées conformément au RGPD
            nom_destinataire: maskName(order.nom_destinataire),
            adresse_livraison: maskAddress(order.adresse_livraison),
            history,
            lastPosition
        };

        res.json(publicData);
    }),

    // 8. Regrouper des livraisons (Livraisons Groupées)
    groupOrders: catchAsync(async (req, res, next) => {
        const { orderIds } = req.body;
        const transporteur_id = req.user.id;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length < 2) {
            return next(new AppError("Vous devez sélectionner au moins 2 commandes pour créer un groupe.", 400));
        }

        const t = await sequelize.transaction();
        try {
            // Vérifier que toutes les commandes sont disponibles
            const orders = await Order.findAll({
                where: {
                    id: { [Op.in]: orderIds },
                    statut_livraison: 'pret'
                },
                transaction: t
            });

            if (orders.length !== orderIds.length) {
                await t.rollback();
                return next(new AppError("Certaines commandes sélectionnées ne sont plus disponibles.", 400));
            }

            // Calcul de l'empreinte carbone économisée : (N - 1) * 2.5 kg
            const co2_saved = (orders.length - 1) * 2.5;

            // Créer le groupe
            const group = await DeliveryGroup.create({
                transporteur_id,
                statut: 'en_attente',
                co2_saved,
                cost_saved: 0 // Optionnel pour le moment
            }, { transaction: t });

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Mettre à jour les commandes
            for (const order of orders) {
                order.transporteur_id = transporteur_id;
                order.delivery_group_id = group.id;
                order.statut_livraison = 'ramasse';
                order.delivery_otp = otp;
                await order.save({ transaction: t });

                await DeliveryLog.create({
                    order_id: order.id,
                    statut: 'ramasse',
                    commentaire: 'Colis récupéré et ajouté au groupe de livraison'
                }, { transaction: t });
            }

            await t.commit();
            res.json({
                message: "Livraisons regroupées avec succès !",
                group,
                co2_saved,
                order_otp: otp
            });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }),

    // 9. Récupérer les groupes de livraison du transporteur
    getMyGroups: catchAsync(async (req, res, next) => {
        const transporteur_id = req.user.id;
        const groups = await DeliveryGroup.findAll({
            where: { transporteur_id },
            include: [{
                model: Order,
                as: 'commandes',
                include: [
                    {
                        model: OrderItem,
                        as: 'details',
                        include: [{ model: Product, as: 'produit' }]
                    },
                    {
                        model: User,
                        as: 'client',
                        attributes: ['nom_complet', 'telephone', 'adresse']
                    }
                ]
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(groups);
    }),

    // 10. Statistiques transporteur (Dashboard Carrier)
    getCarrierStats: catchAsync(async (req, res, next) => {
        const transporteur_id = req.user.id;

        const completed = await Order.count({
            where: { transporteur_id, statut_livraison: 'livre' }
        });

        const active = await Order.count({
            where: {
                transporteur_id,
                statut_livraison: { [Op.in]: ['ramasse', 'en_route', 'en_cours', 'pret'] }
            }
        });

        const available = await Order.count({
            where: { statut_livraison: 'pret', statut: { [Op.in]: ['payé', 'en_préparation'] } }
        });

        const groupsCount = await DeliveryGroup.count({ where: { transporteur_id } });

        const co2Total = await DeliveryGroup.sum('co2_saved', { where: { transporteur_id } }) || 0;

        res.json({
            assigned: active,
            inProgress: await Order.count({
                where: { transporteur_id, statut_livraison: { [Op.in]: ['en_route', 'en_cours'] } }
            }),
            completed,
            available,
            groupsCount,
            co2_saved_kg: parseFloat(co2Total).toFixed(1)
        });
    })
};

module.exports = deliveryController;
