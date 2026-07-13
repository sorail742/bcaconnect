const { Order, OrderItem, Product, Wallet, Transaction, User, DeliveryLog, DeliveryGroup, Notification, sequelize } = require('../models');
const { Op, where, fn, col, cast } = require('sequelize');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Recherche commande par UUID complet, préfixe ORD-XXXXXXXX ou 8+ caractères */
async function findOrderByTrackingRef(trackingNumber) {
    const raw = (trackingNumber || '').trim();
    const cleanId = raw.replace(/^ORD-/i, '').toLowerCase().trim();
    if (!cleanId || cleanId.length < 6) return null;

    if (UUID_RE.test(raw)) {
        return Order.findByPk(raw.toLowerCase());
    }
    if (UUID_RE.test(cleanId)) {
        return Order.findByPk(cleanId);
    }

    return Order.findOne({
        where: where(
            fn('LOWER', cast(col('id'), 'TEXT')),
            { [Op.like]: `${cleanId}%` },
        ),
    });
}
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const escrowService = require('../services/escrowService');
<<<<<<< HEAD
const { carrierAvailableWhere, isCarrierPickupEligible } = require('../utils/deliveryEligibility');
const { emitOrderStatusUpdate } = require('../utils/orderSocketEvents');

/** Normalise les timestamps des logs (Sequelize → snake_case pour le frontend) */
const serializeDeliveryLogs = (logs) => logs.map((log) => {
    const plain = log?.get ? log.toJSON() : { ...log };
    const created = plain.created_at ?? plain.createdAt;
    const updated = plain.updated_at ?? plain.updatedAt;
    return {
        ...plain,
        created_at: created,
        updated_at: updated,
        createdAt: created,
        updatedAt: updated,
    };
});
=======
const shippingService = require('../services/shippingService');
>>>>>>> cc9e8c22a12230e3e9d0244ad41cdcde74833070

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
            where: carrierAvailableWhere(),
            include: [
                {
                    model: OrderItem,
                    as: 'details',
                    include: [{ model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'image_url'] }],
                },
            ],
            order: [['created_at', 'DESC']],
        });
        res.json(orders);
    }),

    // 2. Accepter une livraison + Générer OTP
    assignOrder: catchAsync(async (req, res, next) => {
        const { orderId } = req.body;
        const transporteur_id = req.user.id;

        const order = await Order.findByPk(orderId);
        if (!isCarrierPickupEligible(order)) {
            return next(new AppError("Commande non disponible pour ramassage.", 400));
        }

        // Générer un OTP de 6 chiffres pour la livraison
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        order.transporteur_id = transporteur_id;
        order.statut_livraison = 'ramasse';
        order.delivery_otp = otp;
        await order.save();

        await OrderItem.update(
            { statut: 'expedie' },
            {
                where: {
                    commande_id: orderId,
                    statut: { [Op.in]: ['prepare', 'confirme', 'en_attente'] },
                },
            },
        );

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
            await emitOrderStatusUpdate(io, order);
        }

        res.json({
            message: "Commande assignée. Le code OTP a été envoyé au client.",
            order_otp: process.env.NODE_ENV === 'production' ? undefined : otp
        });
    }),

    // 3. Mise à jour de la position GPS & Statut (Live Tracking)
    updateTracking: catchAsync(async (req, res, next) => {
        const { orderId, latitude, longitude, status, commentaire } = req.body;

        const orderCheck = await Order.findByPk(orderId, { attributes: ['id', 'transporteur_id', 'utilisateur_id'] });
        if (!orderCheck || orderCheck.transporteur_id !== req.user.id) {
            return next(new AppError('Action non autorisée sur cette livraison.', 403));
        }

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

            // COD : encaissement à la livraison → séquestre puis libération vendeurs
            if (order.methode_paiement === 'cod' && order.statut !== 'payé') {
                await escrowService.depositOrderEscrow(orderId, order.details, t);
                order.statut = 'payé';
            }

            order.statut_livraison = 'livre';
            order.delivery_otp = null; // Clear OTP après usage
            await order.save({ transaction: t });

            await OrderItem.update(
                { statut: 'livre' },
                {
                    where: {
                        commande_id: orderId,
                        statut: { [Op.ne]: 'annule' },
                    },
                    transaction: t,
                },
            );

            // LOGIQUE FINANCIÈRE : Libération idempotente via escrowService
            await escrowService.releaseOrderEscrow(orderId, order.details, t, 'release_escrow');

            await DeliveryLog.create({
                order_id: orderId,
                statut: 'livre',
                commentaire: 'Livraison finalisée et validée par OTP'
            }, { transaction: t });

            const fraisPort = parseFloat(order.frais_port || 0);
            let walletBalance = null;
            if (fraisPort > 0) {
                const wallet = await Wallet.findOne({
                    where: { user_id: transporteur_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });
                if (wallet) {
                    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + fraisPort;
                    await wallet.save({ transaction: t });
                    await Transaction.create({
                        portefeuille_id: wallet.id,
                        montant: fraisPort,
                        commande_id: orderId,
                        type_transaction: 'frais_livraison',
                        statut: 'complete',
                        reference_externe: `DEL-${orderId.slice(0, 8)}`,
                        cle_idempotence: `carrier-payout-${orderId}`,
                        metadata: { transporteur_id },
                    }, { transaction: t });
                    walletBalance = parseFloat(wallet.solde_virtuel);
                }
            }

            await t.commit();

            const io = req.app.get('socketio');
            if (io) {
                await emitOrderStatusUpdate(io, orderId);
                if (walletBalance !== null) {
                    io.to(transporteur_id).emit('wallet_updated', { amount: fraisPort, balance: walletBalance });
                }
            }

            res.json({
                message: "Livraison réussie et validée !",
                order,
                frais_verses: fraisPort,
                wallet_balance: walletBalance,
            });
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

    // 5b. Optimiser la tournée du transporteur (ordre de passage + distance/durée)
    optimizeMyRoute: catchAsync(async (req, res, next) => {
        const transporteur_id = req.user.id;
        const returnToStart = req.body?.returnToStart === true || req.query?.returnToStart === 'true';

        const deliveries = await Order.findAll({
            where: {
                transporteur_id,
                statut_livraison: { [Op.ne]: 'livre' },
            },
            attributes: ['id', 'adresse_livraison', 'nom_destinataire', 'statut_livraison'],
            order: [['updated_at', 'DESC']],
        });

        // Géocode chaque adresse vers un centroïde de commune ; ignore l'arrêt si non reconnu.
        const stops = [];
        const skipped = [];
        deliveries.forEach((o) => {
            const geo = shippingService.geocodeAddress(o.adresse_livraison);
            if (geo) {
                stops.push({
                    id: o.id,
                    label: `#${String(o.id).slice(0, 8)} — ${o.adresse_livraison || geo.commune}`,
                    lat: geo.lat,
                    lng: geo.lng,
                    commune: geo.commune,
                    destinataire: o.nom_destinataire,
                });
            } else {
                skipped.push({ id: o.id, adresse: o.adresse_livraison });
            }
        });

        const route = shippingService.optimizeRoute(stops, shippingService.DEPOT_CONAKRY, returnToStart);

        res.json({
            depart: shippingService.DEPOT_CONAKRY,
            total_livraisons: deliveries.length,
            geocodees: stops.length,
            non_localisees: skipped,
            ...route,
        });
    }),

    // 6. Récupérer l'historique de tracking (propriétaire, transporteur ou admin)
    getTrackingHistory: catchAsync(async (req, res, next) => {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId, { attributes: ['id', 'utilisateur_id', 'transporteur_id'] });
        if (!order) return next(new AppError('Commande introuvable.', 404));

        const isVendor = await OrderItem.count({
            where: { commande_id: orderId, fournisseur_id: req.user.id },
        });
        const allowed = order.utilisateur_id === req.user.id
            || order.transporteur_id === req.user.id
            || req.user.role === 'admin'
            || isVendor > 0;
        if (!allowed) return next(new AppError('Accès non autorisé à cet historique.', 403));

        const history = await DeliveryLog.findAll({
            where: { order_id: orderId },
            order: [['created_at', 'ASC']]
        });
        res.json(serializeDeliveryLogs(history));
    }),

    // 6b. Livraisons terminées du transporteur
    getCompletedDeliveries: catchAsync(async (req, res) => {
        const transporteur_id = req.user.id;
        const completed = await Order.findAll({
            where: { transporteur_id, statut_livraison: 'livre' },
            attributes: ['id', 'adresse_livraison', 'frais_port', 'nom_destinataire', 'updated_at', 'date_commande'],
            order: [['updated_at', 'DESC']],
            limit: 50,
        });
        res.json(completed);
    }),

    // 7. Suivi PUBLIC par numéro de commande (sans authentification, données masquées RGPD)
    trackOrderPublic: catchAsync(async (req, res, next) => {
        const { trackingNumber } = req.params;

        const cleanId = (trackingNumber || '').replace(/^ORD-/i, '').toLowerCase().trim();

        if (!cleanId || cleanId.length < 6) {
            return next(new AppError("Numéro de suivi invalide. Format attendu : ORD-XXXXXXXX ou les 8 premiers caractères de l'identifiant.", 400));
        }

        const order = await findOrderByTrackingRef(trackingNumber);

        if (!order) {
            return next(new AppError("Aucune expédition trouvée pour ce numéro de suivi.", 404));
        }

        // Récupérer l'historique de livraison
        const rawHistory = await DeliveryLog.findAll({
            where: { order_id: order.id },
            order: [['created_at', 'ASC']]
        });
        const history = serializeDeliveryLogs(rawHistory);

        // Dernière position GPS connue
        const gpsLogs = history.filter(h => h.latitude != null && h.longitude != null);
        const lastGps = gpsLogs[gpsLogs.length - 1];
        const lastPosition = lastGps
            ? {
                latitude: parseFloat(lastGps.latitude),
                longitude: parseFloat(lastGps.longitude),
                updated_at: lastGps.created_at ?? lastGps.createdAt,
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
                    ...carrierAvailableWhere(),
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

    // 10. Vue logistique admin (flotte + livraisons actives)
    getAdminLogisticsOverview: catchAsync(async (req, res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [pret, active, livreToday, carriers] = await Promise.all([
            Order.count({ where: { statut_livraison: 'pret' } }),
            Order.count({
                where: { statut_livraison: { [Op.in]: ['ramasse', 'en_route', 'en_cours'] } },
            }),
            Order.count({
                where: {
                    statut_livraison: 'livre',
                    updated_at: { [Op.gte]: today },
                },
            }),
            User.findAll({
                where: { role: 'transporteur' },
                attributes: ['id', 'nom_complet', 'email', 'telephone', 'location', 'metadata_transporteur', 'statut'],
            }),
        ]);

        const carrierStats = await Promise.all(carriers.map(async (carrier) => {
            const [completed, activeCount] = await Promise.all([
                Order.count({ where: { transporteur_id: carrier.id, statut_livraison: 'livre' } }),
                Order.count({
                    where: {
                        transporteur_id: carrier.id,
                        statut_livraison: { [Op.in]: ['ramasse', 'en_route', 'en_cours'] },
                    },
                }),
            ]);
            const coords = carrier.location?.coordinates;
            return {
                id: carrier.id,
                nom_complet: carrier.nom_complet,
                email: carrier.email,
                statut: carrier.statut,
                metadata_transporteur: carrier.metadata_transporteur,
                location: coords ? { lat: coords[1], lng: coords[0] } : null,
                completed,
                active_deliveries: activeCount,
            };
        }));

        const activeOrders = await Order.findAll({
            where: { statut_livraison: { [Op.in]: ['ramasse', 'en_route', 'en_cours'] } },
            attributes: ['id', 'adresse_livraison', 'statut_livraison', 'frais_port', 'transporteur_id', 'updated_at'],
            include: [
                { model: User, as: 'transporteur', attributes: ['id', 'nom_complet'] },
                { model: User, as: 'client', attributes: ['id', 'nom_complet'] },
            ],
            order: [['updated_at', 'DESC']],
            limit: 30,
        });

        const activeWithGps = await Promise.all(activeOrders.map(async (order) => {
            const lastLog = await DeliveryLog.findOne({
                where: { order_id: order.id, latitude: { [Op.ne]: null } },
                order: [['created_at', 'DESC']],
            });
            return {
                id: order.id,
                adresse_livraison: order.adresse_livraison,
                statut_livraison: order.statut_livraison,
                frais_port: order.frais_port,
                transporteur: order.transporteur,
                client: order.client,
                lastPosition: lastLog ? {
                    lat: parseFloat(lastLog.latitude),
                    lng: parseFloat(lastLog.longitude),
                    updated_at: lastLog.created_at,
                } : null,
            };
        }));

        const pendingOrders = await Order.findAll({
            where: carrierAvailableWhere(),
            attributes: ['id', 'adresse_livraison', 'frais_port', 'type_livraison', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 20,
        });

        const carriersOnline = carrierStats.filter((c) => c.location).length;

        res.json({
            stats: {
                pret,
                active,
                livre_today: livreToday,
                carriers_online: carriersOnline,
                total_carriers: carriers.length,
            },
            carriers: carrierStats,
            active_orders: activeWithGps,
            pending_orders: pendingOrders,
        });
    }),

    // 11. Statistiques transporteur (Dashboard Carrier)
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
            where: carrierAvailableWhere(),
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
