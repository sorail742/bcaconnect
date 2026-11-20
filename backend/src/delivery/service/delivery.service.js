const { Op } = require('sequelize');
const { sequelize } = require('../../models');
const AppError = require('../../utils/AppError');
const escrowService = require('../../common/escrow/service/escrow.service');
const platformRevenueService = require('../../common/platform-revenue/service/platform-revenue.service');
const walletRepository = require('../../common/wallet/repository/wallet.repository');
const transactionService = require('../../common/transactions/service/transaction.service');
const { carrierAvailableWhere, isCarrierPickupEligible } = require('../../utils/deliveryEligibility');
const { emitOrderStatusUpdate } = require('../../utils/orderSocketEvents');
const shippingService = require('../../services/shippingService');
const deliveryRepository = require('../repository/delivery.repository');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Recherche commande par UUID complet, préfixe ORD-XXXXXXXX ou 8+ caractères */
async function findOrderByTrackingRef(trackingNumber) {
    const raw = (trackingNumber || '').trim();
    const cleanId = raw.replace(/^ORD-/i, '').toLowerCase().trim();
    if (!cleanId || cleanId.length < 6) return null;

    if (UUID_RE.test(raw)) {
        return deliveryRepository.findOrderByExactId(raw.toLowerCase());
    }
    if (UUID_RE.test(cleanId)) {
        return deliveryRepository.findOrderByExactId(cleanId);
    }

    return deliveryRepository.findOrderByIdPrefix(cleanId);
}

/**
 * Une commande peut regrouper des articles de plusieurs boutiques distinctes — le
 * transporteur doit le savoir avant d'accepter (plusieurs points de ramassage).
 * Dérive `vendors` (boutiques distinctes) et `vendor_count` à partir des articles.
 */
const withVendorSummary = (orderInstance) => {
    const order = orderInstance.toJSON ? orderInstance.toJSON() : { ...orderInstance };
    const vendorsMap = new Map();
    for (const item of order.details || []) {
        const store = item.produit?.boutique;
        if (store && !vendorsMap.has(store.id)) vendorsMap.set(store.id, store);
    }
    order.vendors = [...vendorsMap.values()];
    order.vendor_count = order.vendors.length;
    return order;
};

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

const deliveryService = {
    // 1. Lister les commandes disponibles pour ramassage
    async getAvailableOrders() {
        const orders = await deliveryRepository.findAvailableOrders();
        return orders.map(withVendorSummary);
    },

    // 2. Accepter une livraison + Générer OTP
    async assignOrder(orderId, transporteur_id, io) {
        // Verrou de ligne : sans transaction, deux transporteurs qui cliquent "Accepter"
        // au même instant peuvent tous deux passer isCarrierPickupEligible avant que
        // l'un ou l'autre n'écrive — le second .save() écrase alors silencieusement
        // l'assignation du premier (last-write-wins).
        const t = await sequelize.transaction();
        let order;
        try {
            order = await deliveryRepository.findOrderById(orderId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!isCarrierPickupEligible(order)) {
                await t.rollback();
                throw new AppError("Commande non disponible pour ramassage.", 400);
            }

            // Générer un OTP de 6 chiffres pour la livraison
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            order.transporteur_id = transporteur_id;
            order.statut_livraison = 'ramasse';
            order.delivery_otp = otp;
            await deliveryRepository.saveOrder(order, { transaction: t });

            await deliveryRepository.bulkUpdateOrderItemsStatus(orderId, 'expedie', ['prepare', 'confirme', 'en_attente'], { transaction: t });

            await t.commit();
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }

        const otp = order.delivery_otp;

        // Créer le log initial
        await deliveryRepository.createLog({
            order_id: orderId,
            statut: 'ramasse',
            commentaire: 'Colis récupéré chez le marchand'
        });

        // Notifier le client avec le code OTP (canal in-app sécurisé)
        const clientNotif = await deliveryRepository.createNotification({
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

        return {
            message: "Commande assignée. Le code OTP a été envoyé au client.",
            order_otp: process.env.NODE_ENV === 'production' ? undefined : otp
        };
    },

    // 3. Mise à jour de la position GPS & Statut (Live Tracking)
    async updateTracking({ orderId, latitude, longitude, status, commentaire }, user, io) {
        const orderCheck = await deliveryRepository.findOrderById(orderId, { attributes: ['id', 'transporteur_id', 'utilisateur_id'] });
        if (!orderCheck || orderCheck.transporteur_id !== user.id) {
            throw new AppError('Action non autorisée sur cette livraison.', 403);
        }

        const log = await deliveryRepository.createLog({
            order_id: orderId,
            latitude,
            longitude,
            statut: status || 'en_cours',
            commentaire
        });

        if (status) {
            await deliveryRepository.updateOrderDeliveryStatus(orderId, status);
        }

        // UPDATE: Spatial tracking for the transport asset (carrier)
        if (user && latitude && longitude) {
            const point = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
            await deliveryRepository.updateUserLocation(user.id, point);
        }

        // Push temps réel aux clients qui suivent cette commande
        const order = await deliveryRepository.findOrderById(orderId, { attributes: ['id', 'utilisateur_id'] });
        if (io && order) {
            io.to(order.utilisateur_id).emit('delivery_tracking_update', {
                orderId,
                latitude,
                longitude,
                status: status || log.statut,
                timestamp: log.created_at
            });
        }

        return { message: "Position et statut mis à jour", log };
    },

    // 4. Finaliser la livraison avec vérification OTP
    async verifyDelivery({ orderId, otp }, transporteur_id, io) {
        const t = await sequelize.transaction();
        try {
            const order = await deliveryRepository.findOrderWithDetails(orderId, { transaction: t });

            if (!order || order.transporteur_id !== transporteur_id) {
                await t.rollback();
                throw new AppError("Action non autorisée.", 403);
            }

            // Code maître réservé au développement (permet de tester le flux sans dépendre
            // du canal de notification) — jamais actif en production, sous peine de
            // permettre à n'importe quel transporteur de clôturer n'importe quelle livraison.
            const isDevMasterCode = process.env.NODE_ENV !== 'production' && String(otp).trim() === '999999';

            if (String(order.delivery_otp).trim() !== String(otp).trim() && !isDevMasterCode) {
                console.error(`[OTP Verification Failed] OrderId: ${orderId}, Received: '${otp}'`);
                await t.rollback();
                // Ne jamais renvoyer le code attendu dans la réponse : cela viderait
                // instantanément l'intérêt du OTP pour quiconque tente une valeur au hasard.
                throw new AppError('Code OTP incorrect.', 400);
            }

            // COD : encaissement à la livraison → séquestre puis libération vendeurs
            if (order.methode_paiement === 'cod' && order.statut !== 'payé') {
                await escrowService.depositOrderEscrow(orderId, order.details, t);
                order.statut = 'payé';
            }

            order.statut_livraison = 'livre';
            order.delivery_otp = null; // Clear OTP après usage
            await deliveryRepository.saveOrder(order, { transaction: t });

            await deliveryRepository.bulkUpdateOrderItemsStatusExcluding(orderId, 'livre', 'annule', { transaction: t });

            // Garantie BCA (2 ans, conforme à la mention "Garantie Premium" des factures
            // officielles) : activée à la livraison confirmée, un produit = une garantie.
            // C'est le déclencheur qui rend le flux SAV (Mes garanties → Demander une
            // intervention) accessible aux clients — sans cette étape, aucune garantie
            // n'existe jamais et le bouton de demande n'apparaît nulle part.
            const GARANTIE_DUREE_MOIS = 24;
            const dateDebut = new Date();
            const dateFin = new Date(dateDebut);
            dateFin.setMonth(dateFin.getMonth() + GARANTIE_DUREE_MOIS);

            for (const item of order.details) {
                if (item.statut === 'annule' || !item.produit_id) continue;
                await deliveryRepository.findOrCreateGuarantee(
                    { commande_id: orderId, produit_id: item.produit_id },
                    {
                        produit_id: item.produit_id,
                        acheteur_id: order.utilisateur_id,
                        commande_id: orderId,
                        duree_mois: GARANTIE_DUREE_MOIS,
                        date_debut: dateDebut,
                        date_fin: dateFin,
                        status: 'active',
                    },
                    { transaction: t },
                );
            }

            // LOGIQUE FINANCIÈRE : Libération idempotente via escrowService
            await escrowService.releaseOrderEscrow(orderId, order.details, t, 'release_escrow');

            await deliveryRepository.createLog({
                order_id: orderId,
                statut: 'livre',
                commentaire: 'Livraison finalisée et validée par OTP'
            }, { transaction: t });

            const fraisPort = parseFloat(order.frais_port || 0);
            let walletBalance = null;
            if (fraisPort > 0) {
                const wallet = await walletRepository.findByUserIdForUpdate(transporteur_id, t);
                if (wallet) {
                    // Marge plateforme sur les frais de livraison — le reste revient au
                    // transporteur. Voir platformRevenueService.DELIVERY_MARGIN_RATE.
                    const margin = Math.round(fraisPort * platformRevenueService.DELIVERY_MARGIN_RATE * 100) / 100;
                    const platformResult = margin > 0
                        ? await platformRevenueService.creditPlatformWallet(margin, {
                            commande_id: orderId,
                            type: 'marge_livraison',
                            reference_prefix: 'DELREV',
                            metadata: { transporteur_id, taux: platformRevenueService.DELIVERY_MARGIN_RATE },
                        }, t)
                        : { credited: false };
                    const carrierAmount = fraisPort - (platformResult.credited ? margin : 0);

                    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + carrierAmount;
                    await walletRepository.save(wallet, { transaction: t });
                    await transactionService.create({
                        portefeuille_id: wallet.id,
                        montant: carrierAmount,
                        commande_id: orderId,
                        type_transaction: 'frais_livraison',
                        statut: 'complete',
                        reference_externe: `DEL-${orderId.slice(0, 8)}`,
                        metadata: { transporteur_id, marge_prelevee: platformResult.credited ? margin : 0 },
                    }, { transaction: t });
                    walletBalance = parseFloat(wallet.solde_virtuel);
                }
            }

            await t.commit();

            if (io) {
                await emitOrderStatusUpdate(io, orderId);
                if (walletBalance !== null) {
                    io.to(transporteur_id).emit('wallet_updated', { amount: fraisPort, balance: walletBalance });
                }
            }

            return {
                message: "Livraison réussie et validée !",
                order,
                frais_verses: fraisPort,
                wallet_balance: walletBalance,
            };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    // 5. Récupérer les livraisons assignées au transporteur connecté
    async getMyDeliveries(transporteur_id) {
        const history = await deliveryRepository.findOrdersByTransporteurActive(transporteur_id);
        return history.map(withVendorSummary);
    },

    // 5b. Optimiser la tournée du transporteur (ordre de passage + distance/durée)
    async optimizeMyRoute(transporteur_id, returnToStart) {
        const deliveries = await deliveryRepository.findOrdersForRouteOptimization(transporteur_id);

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

        return {
            depart: shippingService.DEPOT_CONAKRY,
            total_livraisons: deliveries.length,
            geocodees: stops.length,
            non_localisees: skipped,
            ...route,
        };
    },

    // 6. Récupérer l'historique de tracking (propriétaire, transporteur ou admin)
    async getTrackingHistory(orderId, user) {
        const order = await deliveryRepository.findOrderById(orderId, { attributes: ['id', 'utilisateur_id', 'transporteur_id'] });
        if (!order) throw new AppError('Commande introuvable.', 404);

        const isVendor = await deliveryRepository.countVendorItemsForOrder(orderId, user.id);
        const allowed = order.utilisateur_id === user.id
            || order.transporteur_id === user.id
            || user.role === 'admin'
            || isVendor > 0;
        if (!allowed) throw new AppError('Accès non autorisé à cet historique.', 403);

        const history = await deliveryRepository.findLogsByOrder(orderId);
        return serializeDeliveryLogs(history);
    },

    // 6b. Livraisons terminées du transporteur
    async getCompletedDeliveries(transporteur_id) {
        return deliveryRepository.findCompletedDeliveries(transporteur_id, 50);
    },

    // 7. Suivi PUBLIC par numéro de commande (sans authentification, données masquées RGPD)
    async trackOrderPublic(trackingNumber) {
        const cleanId = (trackingNumber || '').replace(/^ORD-/i, '').toLowerCase().trim();

        if (!cleanId || cleanId.length < 6) {
            throw new AppError("Numéro de suivi invalide. Format attendu : ORD-XXXXXXXX ou les 8 premiers caractères de l'identifiant.", 400);
        }

        const order = await findOrderByTrackingRef(trackingNumber);

        if (!order) {
            throw new AppError("Aucune expédition trouvée pour ce numéro de suivi.", 404);
        }

        // Récupérer l'historique de livraison
        const rawHistory = await deliveryRepository.findLogsByOrder(order.id);
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
        return {
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
    },

    // 8. Regrouper des livraisons (Livraisons Groupées)
    async groupOrders(orderIds, transporteur_id, io) {
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length < 2) {
            throw new AppError("Vous devez sélectionner au moins 2 commandes pour créer un groupe.", 400);
        }

        const t = await sequelize.transaction();
        try {
            // Vérifier que toutes les commandes sont disponibles
            const orders = await deliveryRepository.findOrdersByIdsAvailable(orderIds, { transaction: t });

            if (orders.length !== orderIds.length) {
                await t.rollback();
                throw new AppError("Certaines commandes sélectionnées ne sont plus disponibles.", 400);
            }

            // Calcul de l'empreinte carbone économisée : (N - 1) * 2.5 kg
            const co2_saved = (orders.length - 1) * 2.5;

            // Créer le groupe
            const group = await deliveryRepository.createGroup({
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
                await deliveryRepository.saveOrder(order, { transaction: t });

                await deliveryRepository.createLog({
                    order_id: order.id,
                    statut: 'ramasse',
                    commentaire: 'Colis récupéré et ajouté au groupe de livraison'
                }, { transaction: t });

                // Notifier le client du nouveau code OTP suite au groupement
                const clientNotif = await deliveryRepository.createNotification({
                    utilisateur_id: order.utilisateur_id,
                    titre: 'Code de livraison BCA (Groupe)',
                    message: `Votre commande a été groupée par le livreur. Nouveau code OTP à remettre à la livraison : <span class="font-black text-primary tracking-widest">${otp}</span>`,
                    type: 'delivery',
                    metadata: { order_id: order.id, otp_hint: otp.slice(0, 2) + '****', group_id: group.id }
                }, { transaction: t });

                if (io) {
                    io.to(order.utilisateur_id).emit('notification_received', clientNotif);
                    await emitOrderStatusUpdate(io, order);
                }
            }

            await t.commit();
            return {
                message: "Livraisons regroupées avec succès !",
                group,
                co2_saved,
                order_otp: otp
            };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    // 9. Récupérer les groupes de livraison du transporteur
    async getMyGroups(transporteur_id) {
        return deliveryRepository.findGroupsByTransporteur(transporteur_id);
    },

    // 10. Vue logistique admin (flotte + livraisons actives)
    async getAdminLogisticsOverview() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [pret, active, livreToday, carriers] = await Promise.all([
            deliveryRepository.countOrders({ statut_livraison: 'pret' }),
            deliveryRepository.countOrders({
                statut_livraison: { [Op.in]: ['ramasse', 'en_route', 'en_cours'] },
            }),
            deliveryRepository.countOrders({
                statut_livraison: 'livre',
                updated_at: { [Op.gte]: today },
            }),
            deliveryRepository.findTransporteurs(),
        ]);

        const carrierStats = await Promise.all(carriers.map(async (carrier) => {
            const [completed, activeCount] = await Promise.all([
                deliveryRepository.countOrders({ transporteur_id: carrier.id, statut_livraison: 'livre' }),
                deliveryRepository.countOrders({
                    transporteur_id: carrier.id,
                    statut_livraison: { [Op.in]: ['ramasse', 'en_route', 'en_cours'] },
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

        const activeOrders = await deliveryRepository.findActiveOrdersWithParties(30);

        const activeWithGps = await Promise.all(activeOrders.map(async (order) => {
            const lastLog = await deliveryRepository.findLastGpsLogForOrder(order.id);
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

        const pendingOrders = await deliveryRepository.findPendingOrders(20);

        const carriersOnline = carrierStats.filter((c) => c.location).length;

        return {
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
        };
    },

    // 11. Statistiques transporteur (Dashboard Carrier)
    async getCarrierStats(transporteur_id) {
        const completed = await deliveryRepository.countOrders({ transporteur_id, statut_livraison: 'livre' });

        const active = await deliveryRepository.countOrders({
            transporteur_id,
            statut_livraison: { [Op.in]: ['ramasse', 'en_route', 'en_cours', 'pret'] }
        });

        const available = await deliveryRepository.countOrders(carrierAvailableWhere());

        const groupsCount = await deliveryRepository.countGroupsByTransporteur(transporteur_id);

        const co2Total = await deliveryRepository.sumGroupCo2ByTransporteur(transporteur_id) || 0;

        return {
            assigned: active,
            inProgress: await deliveryRepository.countOrders({
                transporteur_id, statut_livraison: { [Op.in]: ['en_route', 'en_cours'] }
            }),
            completed,
            available,
            groupsCount,
            co2_saved_kg: parseFloat(co2Total).toFixed(1)
        };
    },

    // 12. Optimisation d'Itinéraire (Génération lien Google Maps)
    async optimizeRoute(group_id, transporteur_id) {
        const group = await deliveryRepository.findGroupByIdForTransporteur(group_id, transporteur_id);

        if (!group) {
            throw new AppError('Groupe de livraison introuvable ou accès non autorisé.', 404);
        }

        const orders = await deliveryRepository.findOrdersByGroupActive(group_id);

        if (orders.length === 0) {
            throw new AppError('Aucune commande active à livrer dans ce groupe.', 400);
        }

        // Construire l'URL Google Maps multi-arrêts
        // Format: https://www.google.com/maps/dir/?api=1&origin=Ma+Position&destination=Dernier+Point&waypoints=Point1|Point2

        const addresses = orders.map(o => encodeURIComponent(o.adresse_livraison || 'Conakry, Guinea')).filter(Boolean);

        if (addresses.length === 0) {
            throw new AppError('Les commandes ne contiennent pas d\'adresse de livraison valide.', 400);
        }

        const origin = 'Conakry, Guinea'; // On pourrait utiliser la localisation actuelle du transporteur s'il l'envoie
        const destination = addresses[addresses.length - 1];
        const waypoints = addresses.slice(0, -1).join('|');

        let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
        if (waypoints) {
            googleMapsUrl += `&waypoints=${waypoints}`;
        }

        return {
            message: 'Itinéraire généré avec succès.',
            url: googleMapsUrl,
            stops: orders.length
        };
    },
};

module.exports = deliveryService;
