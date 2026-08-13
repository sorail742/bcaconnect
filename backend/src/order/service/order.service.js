const { sequelize } = require('../../models');
const AppError = require('../../utils/AppError');
const escrowService = require('../../common/escrow/service/escrow.service');
const walletRepository = require('../../common/wallet/repository/wallet.repository');
const transactionService = require('../../common/transactions/service/transaction.service');
const productRepository = require('../../product/repository/product.repository');
const { calculateShipping, listDeliveryOptions } = require('../../services/shippingService');
const { reserveStockForItems } = require('../../services/orderStockService');
const couponService = require('../../coupon/service/coupon.service');
const {
    syncOrderReadyForPickup,
    syncOrderLogisticsFromItems,
    notifyCarriersOrderReady,
} = require('../../services/deliveryNotificationService');
const {
    assertVendorItemTransition,
    canVendorCancelItem,
} = require('../../utils/orderItemTransitions');
const { emitOrderStatusUpdate } = require('../../utils/orderSocketEvents');
const { approximateGeocode } = require('../../utils/geoUtils');
const orderRepository = require('../repository/order.repository');

function resolveInitialOrderStatut(paymentMethod) {
    if (paymentMethod === 'wallet') return 'payé';
    if (paymentMethod === 'cod') return 'en_préparation';
    return 'en_attente_paiement';
}

const orderService = {
    getShippingQuote({ adresse, items, type }) {
        const itemsCount = parseInt(items, 10) || 1;
        if (type) {
            return calculateShipping(adresse, itemsCount, type);
        }
        return { options: listDeliveryOptions(adresse, itemsCount) };
    },

    async create({ items, cle_idempotence, deliveryInfo, paymentMethod, type_livraison, mode_resilience, code_promo }, user, io) {
        console.log("🚀 [ORDER CREATE] Début création commande...");
        const t = await sequelize.transaction();
        try {
            console.log(`📦 [ORDER DEBUG] Items: ${items?.length}, Method: ${paymentMethod}`);
            const utilisateur_id = user.id;

            // ... (Vérification Idempotence existante)
            if (cle_idempotence) {
                const existingOrder = await orderRepository.findByCleIdempotence(cle_idempotence, t);
                if (existingOrder) {
                    await t.rollback();
                    return { outcome: 'already_processed', order: existingOrder };
                }
            }

            let total_produits = 0;
            const orderItemsByVendor = [];

            for (const item of items) {
                const pid = item.id || item.productId || item.product_id || item.produit_id;
                const qty = item.quantity ?? item.quantite;
                const variantId = item.variantId || item.variant_id || null;
                if (!pid) {
                    console.error('🔴 [ORDER ERROR] item sans ID:', item);
                    throw new AppError("L'ID du produit est manquant pour l'un des articles.", 400);
                }
                const product = await productRepository.findByIdForUpdate(pid, t);
                if (!product) throw new AppError(`Produit ${pid} non trouvé.`, 404);

                let unitPrice = product.prix_unitaire;
                let variantName = null;
                if (variantId) {
                    const variant = await orderRepository.findVariantForUpdate(variantId, t);
                    if (!variant || variant.produit_id !== product.id) {
                        throw new AppError(`Variante introuvable pour "${product.nom_produit}".`, 404);
                    }
                    if (!variant.actif) throw new AppError(`La variante "${variant.nom_variante}" n'est plus disponible.`, 400);
                    if (variant.stock_quantite < qty) throw new AppError(`Stock insuffisant pour "${product.nom_produit} — ${variant.nom_variante}".`, 400);
                    unitPrice = variant.prix_unitaire !== null ? variant.prix_unitaire : product.prix_unitaire;
                    variantName = variant.nom_variante;
                } else {
                    if (product.stock_quantite < qty) throw new AppError(`Stock insuffisant: ${product.nom_produit}.`, 400);
                }

                const subtotal = unitPrice * qty;
                total_produits += parseFloat(subtotal);

                // Use the correct alias 'boutique' as defined in models/index.js
                const store = await productRepository.getStoreForProduct(product, t);

                if (!store) {
                    console.error(`🔴 [ORDER ERROR] Boutique non trouvée pour le produit ${product.id}`);
                    throw new AppError(`La boutique associée au produit "${product.nom_produit}" est introuvable.`, 404);
                }

                console.log(`[DEBUG ORDER] Item: ${product.nom_produit}, Vendor: ${store.proprietaire_id}`);

                // 🛑 SÉCURITÉ ANTI-FRAUDE : Empêcher l'achat de ses propres produits
                if (store.proprietaire_id === utilisateur_id) {
                    throw new AppError(`Transaction refusée : Vous ne pouvez pas acheter votre propre produit ("${product.nom_produit}").`, 400);
                }

                orderItemsByVendor.push({
                    produit_id: product.id,
                    fournisseur_id: store.proprietaire_id,
                    boutique_id: store.id,
                    quantite: qty,
                    prix_unitaire_achat: unitPrice,
                    variante_id: variantId || null,
                    variante_nom: variantName,
                    statut: 'en_attente'
                });
            }

            // --- CODE PROMO (optionnel) ---
            // La réduction est répercutée directement sur prix_unitaire_achat de chaque
            // article qualifiant (voir couponService.applyDiscountToItems), PUIS
            // total_produits est recalculé à partir des prix déjà réduits — jamais une
            // simple soustraction sur le total final, sinon le séquestre fournisseur
            // (calculé plus loin depuis prix_unitaire_achat) resterait basé sur le prix
            // plein pendant que l'acheteur ne paierait que le prix réduit.
            let appliedCoupon = null;
            let discountAmount = 0;
            if (code_promo) {
                const validation = await couponService.validate(code_promo, utilisateur_id, orderItemsByVendor, t);
                couponService.applyDiscountToItems(orderItemsByVendor, validation.coupon, validation.discount, validation.qualifyingItems);
                appliedCoupon = validation.coupon;
                discountAmount = validation.discount;
                total_produits = orderItemsByVendor.reduce(
                    (sum, it) => sum + parseFloat(it.prix_unitaire_achat) * it.quantite, 0,
                );
            }

            const reserveStockNow = paymentMethod === 'wallet' || paymentMethod === 'cod';
            if (reserveStockNow) {
                await reserveStockForItems(
                    orderItemsByVendor.map((i) => ({ produit_id: i.produit_id, quantite: i.quantite, variante_id: i.variante_id })),
                    t,
                );
            }

            // --- CALCUL DES FRAIS DE PORT (éco / standard / prioritaire) ---
            const shipping = calculateShipping(
                deliveryInfo?.adresse,
                items.length,
                type_livraison || 'standard',
            );
            const frais_port = shipping.frais_port;
            const total_ttc = total_produits + frais_port;

            // Délai de livraison : échéance concrète (pas seulement un nombre de jours),
            // pour permettre un vrai compte à rebours et détecter les retards.
            const dateLivraisonPrevue = new Date();
            dateLivraisonPrevue.setDate(dateLivraisonPrevue.getDate() + (shipping.delai_estime_jours || 5));

            // 3. Gestion du paiement
            let wallet = null;
            if (paymentMethod === 'wallet') {
                wallet = await walletRepository.findByUserId(utilisateur_id, { transaction: t });
                if (!wallet || parseFloat(wallet.solde_virtuel) < total_ttc) {
                    throw new AppError('Solde insuffisant dans votre portefeuille BCA.', 400);
                }
                await walletRepository.decrementBalance(wallet, total_ttc, { transaction: t });
            }

            // Create Order
            const order = await orderRepository.create({
                utilisateur_id,
                total_ttc,
                frais_port,
                type_livraison: shipping.type_livraison,
                delai_estime_jours: shipping.delai_estime_jours,
                date_livraison_prevue: dateLivraisonPrevue,
                statut: resolveInitialOrderStatut(paymentMethod),
                methode_paiement: paymentMethod || 'wallet',
                mode_resilience: Boolean(mode_resilience),
                nom_destinataire: deliveryInfo?.nom,
                telephone_livraison: deliveryInfo?.telephone,
                adresse_livraison: deliveryInfo?.adresse,
                cle_idempotence: cle_idempotence || undefined,
                coupon_id: appliedCoupon?.id || null,
                code_promo: appliedCoupon?.code || null,
                montant_reduction: discountAmount,
            }, { transaction: t });

            if (appliedCoupon) {
                await couponService.recordUsage(appliedCoupon, utilisateur_id, order.id, discountAmount, t);
            }

            // Create OrderItems
            for (const item of orderItemsByVendor) {
                await orderRepository.createItem({
                    ...item,
                    commande_id: order.id
                }, { transaction: t });
            }

            // Create financial Transaction entry
            if (paymentMethod === 'wallet' && wallet) {
                await transactionService.create({
                    portefeuille_id: wallet.id,
                    commande_id: order.id,
                    montant: total_ttc,
                    type_transaction: 'achat_produit',
                    statut: 'complete'
                }, { transaction: t });

                // 🛡️ SÉQUESTRE AUTOMATIQUE : Créditer les vendeurs en mode séquestre
                const orderItems = await orderRepository.findItemsByOrderId(order.id, { transaction: t });
                await escrowService.depositOrderEscrow(order.id, orderItems, t);
            }

            await t.commit();
            console.log(`✅ [ORDER SUCCESS] Commande ${order.id} créée.`);

            // ⚡ NOTIFICATIONS TEMPS RÉEL (Non-bloquant)
            try {
                if (io) {
                    // 1. Notification pour l'acheteur (Confirmation)
                    const buyerNotif = await orderRepository.createNotification({
                        utilisateur_id: utilisateur_id,
                        titre: "Commande confirmée !",
                        message: `Votre commande <span class="font-black text-primary">#${order.id.slice(0, 8)}</span> d'un montant de <span class="italic font-bold text-emerald-600">${total_ttc.toLocaleString('fr-FR')} GNF</span> a été enregistrée.`,
                        type: 'order'
                    });
                    io.to(utilisateur_id).emit('notification_received', buyerNotif);

                    // 2. Notifications pour les vendeurs
                    const uniqueVendors = [...new Set(orderItemsByVendor.map(item => item.fournisseur_id))];
                    for (const vendorId of uniqueVendors) {
                        const vendorNotif = await orderRepository.createNotification({
                            utilisateur_id: vendorId,
                            titre: "Nouvelle vente !",
                            message: `Vous avez reçu une nouvelle commande <span class="font-black text-primary">#${order.id.slice(0, 8)}</span>. Veuillez préparer les produits.`,
                            type: 'order'
                        });
                        io.to(vendorId).emit('notification_received', vendorNotif);
                    }
                }
            } catch (notifError) {
                console.warn("⚠️ [ORDER WARN] Échec de l'envoi des notifications:", notifError.message);
            }

            return { outcome: 'created', order };
        } catch (error) {
            console.error("🔴 [ORDER 500] Erreur fatale:", error.message);
            if (!t.finished) await t.rollback();
            if (error instanceof AppError) throw error;
            const msg = error.message?.includes('value too long')
                ? 'Erreur base de données : champ livraison trop court. Relancez les migrations (npm run migrate).'
                : (error.message || 'Erreur création commande.');
            throw new AppError(msg, 400);
        }
    },

    async getMyOrders(userId, { page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;

        console.log(`🔍 Récupération des commandes pour l'utilisateur : ${userId}`);

        const { count, rows: orders } = await orderRepository.findAndCountAllByUser(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        console.log(`✅ ${orders.length} commandes trouvées sur un total de ${count}.`);

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            orders
        };
    },

    // Carte des marchands du client connecté : géocode approximatif (commune) dérivé
    // de la localisation déclarée de chaque boutique distincte à laquelle il a déjà
    // acheté un produit. Si la boutique n'a renseigné aucune commune reconnue (champ
    // `localisation` par défaut "Guinée"), on retombe sur l'adresse réelle déclarée
    // par le propriétaire de la boutique — toujours une donnée réelle, jamais inventée.
    async getMyVendorsMap(userId) {
        const items = await orderRepository.findItemsForUserVendorsMap(userId);

        const storesById = new Map();
        for (const item of items) {
            const store = item.produit?.boutique;
            if (store && !storesById.has(store.id)) storesById.set(store.id, store);
        }

        const stores = [...storesById.values()];
        const ownerIds = stores.map((s) => s.proprietaire_id).filter(Boolean);
        const owners = ownerIds.length
            ? await orderRepository.findUsersByIds(ownerIds, ['id', 'adresse'])
            : [];
        const ownerAdresseById = Object.fromEntries(owners.map((o) => [o.id, o.adresse]));

        return stores
            .map((s) => {
                const geo = (s.localisation ? approximateGeocode(s.localisation, s.id) : null)
                    || (ownerAdresseById[s.proprietaire_id] ? approximateGeocode(ownerAdresseById[s.proprietaire_id], s.id) : null);
                return geo
                    ? {
                        id: s.id, nom_boutique: s.nom_boutique, slug: s.slug, logo_url: s.logo_url,
                        categorie_principale: s.categorie_principale, is_verified: s.is_verified,
                        location: { lat: geo.lat, lng: geo.lng }, commune: geo.commune,
                    }
                    : null;
            })
            .filter(Boolean);
    },

    async getOrderById(id, user) {
        const order = await orderRepository.findByIdWithItemsProductsStoreAndClient(id);

        if (!order) {
            throw new AppError('Commande non trouvée.', 404);
        }

        const isOwner = order.utilisateur_id === user.id;
        const isRelatedVendor = order.details.some(item => item.fournisseur_id === user.id);
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isRelatedVendor && !isAdmin) {
            throw new AppError('Non autorisé à voir cette commande.', 403);
        }

        return order;
    },

    async getVendorOrders(vendorId, { page = 1, limit = 50 } = {}) {
        const offset = (page - 1) * limit;

        const { count, rows: orders } = await orderRepository.findAndCountAllByVendor(vendorId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            orders,
        };
    },

    async getVendorOrderLogistics(orderId, user) {
        const vendorId = user.id;

        const vendorItems = await orderRepository.countItemsByOrderAndVendor(orderId, vendorId);
        if (!vendorItems && user.role !== 'admin') {
            throw new AppError('Non autorisé à consulter cette commande.', 403);
        }

        const order = await orderRepository.findByIdWithClientAndTransporteur(orderId, [
            'id', 'statut', 'statut_livraison', 'transporteur_id',
            'frais_port', 'type_livraison', 'adresse_livraison', 'nom_destinataire',
            'date_commande', 'methode_paiement',
        ]);
        if (!order) throw new AppError('Commande non trouvée.', 404);

        const history = await orderRepository.findDeliveryLogsByOrderId(orderId);
        const gpsLogs = history.filter((h) => h.latitude != null && h.longitude != null);
        const lastPosition = gpsLogs.length
            ? {
                lat: parseFloat(gpsLogs[gpsLogs.length - 1].latitude),
                lng: parseFloat(gpsLogs[gpsLogs.length - 1].longitude),
                updated_at: gpsLogs[gpsLogs.length - 1].created_at,
            }
            : null;

        return { order, history, lastPosition };
    },

    async getAllOrders({ page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;

        const { count, rows: orders } = await orderRepository.findAndCountAllAdmin({
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            orders
        };
    },

    async updateItemStatus(itemId, { statut, status }, user, io, app) {
        const t = await sequelize.transaction();
        try {
            const newStatus = statut || status;
            const fournisseur_id = user.id;

            const item = await orderRepository.findItemById(itemId, { transaction: t });
            if (!item) {
                await t.rollback();
                throw new AppError('Élément de commande non trouvé.', 404);
            }

            if (item.fournisseur_id !== fournisseur_id && user.role !== 'admin') {
                await t.rollback();
                throw new AppError("Vous n'êtes pas autorisé à modifier cette commande.", 403);
            }

            const parentOrder = await orderRepository.findById(item.commande_id, { transaction: t });
            if (!parentOrder) {
                await t.rollback();
                throw new AppError('Commande parente introuvable.', 404);
            }

            if (user.role !== 'admin') {
                assertVendorItemTransition(item.statut, newStatus);
                if (newStatus === 'annule' && !canVendorCancelItem(item.statut, parentOrder.statut_livraison)) {
                    throw new AppError('Impossible d\'annuler : le livreur a déjà pris en charge le colis.', 400);
                }
                if (newStatus === 'expedie' && !parentOrder.transporteur_id) {
                    throw new AppError('Aucun livreur assigné. Attendez qu\'un transporteur accepte la mission.', 400);
                }
            }

            item.statut = newStatus;
            await orderRepository.saveItem(item, { transaction: t });

            const syncPickup = await syncOrderReadyForPickup(item.commande_id, t);
            const syncLogistics = await syncOrderLogisticsFromItems(item.commande_id, t);
            const orderPrepared = syncPickup.ready || syncLogistics?.readyForCarrier;

            await t.commit();

            const order = await orderRepository.findById(item.commande_id);

            // ⚡ NOTIFICATION POUR LE CLIENT
            if (io && order) {
                const statusLabels = {
                    confirme: 'a été confirmée par le vendeur',
                    prepare: 'est en cours de préparation',
                    expedie: 'a été remise au livreur',
                    livre: 'a été livrée',
                    annule: 'a été annulée',
                    en_attente: 'est de nouveau en attente',
                };

                const clientNotif = await orderRepository.createNotification({
                    utilisateur_id: order.utilisateur_id,
                    titre: "Mise à jour de votre commande",
                    message: `L'article <span class="font-bold underline">${item.id.slice(0, 8)}</span> de votre commande <span class="font-black text-primary">#${order.id.slice(0, 8)}</span> ${statusLabels[newStatus] || 'a changé de statut'}.`,
                    type: 'order'
                });
                io.to(order.utilisateur_id).emit('notification_received', clientNotif);
            }

            if (orderPrepared) {
                await notifyCarriersOrderReady(app, order);
            }

            if (io && order) {
                await emitOrderStatusUpdate(io, order, {
                    itemId: item.id,
                    itemStatut: newStatus,
                });
            }

            return {
                message: "Statut mis à jour avec succès",
                item,
                orderPrepared,
            };
        } catch (error) {
            if (!t.finished) await t.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Erreur mise à jour article.', 400);
        }
    },

    /** Préparer en une fois tous les articles du vendeur pour une commande */
    async prepareVendorOrder(orderId, user, io, app) {
        const t = await sequelize.transaction();
        try {
            const vendorId = user.id;

            const vendorItems = await orderRepository.findItemsByOrderAndVendor(orderId, vendorId, { transaction: t });

            if (!vendorItems.length) {
                await t.rollback();
                throw new AppError('Aucun article de cette commande pour votre boutique.', 404);
            }

            const pendingItems = vendorItems.filter((i) => ['en_attente', 'confirme'].includes(i.statut));

            if (!pendingItems.length) {
                const allPrepared = vendorItems.every((i) => ['prepare', 'livre'].includes(i.statut));
                if (!allPrepared) {
                    await t.rollback();
                    throw new AppError('Aucun article en attente de préparation pour cette commande.', 404);
                }
                const { ready: orderPrepared } = await syncOrderReadyForPickup(orderId, t);
                await t.commit();
                if (orderPrepared) {
                    const order = await orderRepository.findById(orderId);
                    await notifyCarriersOrderReady(app, order).catch((e) => {
                        console.warn('[vendor-prepare] Notification transporteur:', e.message);
                    });
                }
                if (io) await emitOrderStatusUpdate(io, orderId);
                return {
                    message: 'Vos articles sont déjà préparés.',
                    prepared: 0,
                    orderPrepared,
                    alreadyPrepared: true,
                };
            }

            for (const item of pendingItems) {
                item.statut = 'prepare';
                await orderRepository.saveItem(item, { transaction: t });
            }

            const { ready: orderPrepared } = await syncOrderReadyForPickup(orderId, t);
            await t.commit();

            if (orderPrepared) {
                const order = await orderRepository.findById(orderId);
                await notifyCarriersOrderReady(app, order).catch((e) => {
                    console.warn('[vendor-prepare] Notification transporteur:', e.message);
                });
            }

            if (io) await emitOrderStatusUpdate(io, orderId);

            return {
                message: `${pendingItems.length} article(s) marqué(s) comme préparé(s).`,
                prepared: pendingItems.length,
                orderPrepared,
            };
        } catch (error) {
            if (!t.finished) await t.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Erreur préparation commande.', 400);
        }
    },

    async updateOrderStatus(orderId, { statut }, user) {
        const t = await sequelize.transaction();
        try {
            const order = await orderRepository.findByIdWithDetails(orderId, { transaction: t });
            if (!order) {
                await t.rollback();
                throw new AppError('Commande non trouvée.', 404);
            }

            const isAdmin = user.role === 'admin';
            const isOwner = order.utilisateur_id === user.id;

            // Matrice de transition stricte pour ORDER (Global)
            const transitions = {
                'payé': ['annulé', 'retourné'],
                'en_préparation': ['annulé'],
                'en_attente_paiement': ['annulé'],
                'annulé': [],
                'retourné': []
            };

            if (!transitions[order.statut] || !transitions[order.statut].includes(statut)) {
                await t.rollback();
                throw new AppError(`Transition globale invalide: de "${order.statut}" vers "${statut}".`, 400);
            }

            if (statut === 'annulé' && !isOwner && !isAdmin) {
                await t.rollback();
                throw new AppError('Non autorisé à annuler cette commande.', 403);
            }

            const allowedStatus = ['annulé', 'retourné'];
            if (!allowedStatus.includes(statut)) {
                await t.rollback();
                throw new AppError("Seul l'admin peut initier un retour global.", 403);
            }

            // Si annulation d'une commande payée ou en attente -> Remboursement
            if (statut === 'annulé' && ['payé', 'en_attente_paiement', 'en_préparation'].includes(order.statut)) {
                const buyerWallet = await walletRepository.findByUserIdForUpdate(order.utilisateur_id, t);

                if (buyerWallet && order.statut === 'payé') {
                    // 1. Créditer l'acheteur
                    buyerWallet.solde_virtuel = parseFloat(buyerWallet.solde_virtuel) + parseFloat(order.total_ttc);
                    await walletRepository.save(buyerWallet, { transaction: t });

                    await transactionService.create({
                        portefeuille_id: buyerWallet.id,
                        commande_id: order.id,
                        montant: order.total_ttc,
                        type_transaction: 'remboursement',
                        statut: 'complete',
                        reference_externe: `REFUND-CL-${order.id.slice(0, 8)}`
                    }, { transaction: t });

                    // 2. Annuler le séquestre vendeurs (idempotent)
                    for (const item of order.details) {
                        await escrowService.reverseItemEscrow(item, order.id, t);
                    }
                }

                // Restaurer stocks uniquement si le stock avait été réservé (wallet, COD ou commande payée)
                const stockWasReserved = order.statut === 'payé'
                    || order.methode_paiement === 'cod'
                    || order.methode_paiement === 'wallet';
                if (stockWasReserved) {
                    for (const item of order.details) {
                        await productRepository.incrementStock(item.produit_id, item.quantite, t);
                    }
                }
                // OrderItem.statut utilise 'annule' (sans accent) partout ailleurs
                // (orderItemTransitions.js, deliveryNotificationService.js) — 'annulé'
                // ici romprait silencieusement ces recherches par égalité stricte.
                await orderRepository.updateItemsStatus(order.id, 'annule', { transaction: t });
            }

            order.statut = statut;
            await orderRepository.save(order, { transaction: t });

            await t.commit();
            return { message: `Commande passée en état: ${statut}`, order };
        } catch (error) {
            if (!t.finished) await t.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Erreur mise à jour commande.', 400);
        }
    }
};

module.exports = orderService;
