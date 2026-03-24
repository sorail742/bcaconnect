const { Order, OrderItem, Product, Wallet, Transaction, User, Notification, sequelize } = require('../models');

// Logic de calcul des frais de livraison dynamique pour la Guinée
const calculateShippingFee = (adresse, itemsCount) => {
    const checkCase = (str) => str?.toLowerCase() || '';
    const addr = checkCase(adresse);

    // Conakry : Dynamisation par zone
    const isConakry = addr.includes('conakry');
    const isKaloum = addr.includes('kaloum'); // Zone administrative/business (souvent plus cher ou base différente)
    const otherCommunes = ['dixinn', 'ratoma', 'matam', 'matoto', 'kagbelen', 'dubréka'];
    const matchesCommune = otherCommunes.some(c => addr.includes(c));

    if (isKaloum) {
        return 25000 + (itemsCount * 2500); // Kaloum est plus central mais accès plus restreint
    }

    if (isConakry || matchesCommune) {
        return 20000 + (itemsCount * 2000); // Standard Conakry
    }

    // Province : Base fixe plus élevée
    return 50000 + (itemsCount * 5000);
};

const orderController = {
    create: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { items, cle_idempotence, deliveryInfo, paymentMethod } = req.body;
            const utilisateur_id = req.user.id;

            // ... (Vérification Idempotence existante)
            if (cle_idempotence) {
                const existingOrder = await Order.findOne({ where: { cle_idempotence }, transaction: t });
                if (existingOrder) {
                    await t.rollback();
                    return res.status(200).json(existingOrder);
                }
            }

            let total_produits = 0;
            const orderItemsByVendor = [];

            for (const item of items) {
                const product = await Product.findByPk(item.productId, { lock: t.LOCK.UPDATE, transaction: t });
                if (!product) throw new Error(`Produit ${item.productId} non trouvé.`);
                if (product.stock_quantite < item.quantity) throw new Error(`Stock insuffisant: ${product.nom_produit}.`);

                const subtotal = product.prix_unitaire * item.quantity;
                total_produits += parseFloat(subtotal);

                const store = await product.getStore({ transaction: t });
                orderItemsByVendor.push({
                    produit_id: product.id,
                    fournisseur_id: store.proprietaire_id,
                    quantite: item.quantity,
                    prix_unitaire_achat: product.prix_unitaire,
                    statut: 'en_attente'
                });

                await product.decrement('stock_quantite', { by: item.quantity, transaction: t });
            }

            // --- CALCUL DES FRAIS DE PORT ---
            const frais_port = calculateShippingFee(deliveryInfo?.adresse, items.length);
            const total_ttc = total_produits + frais_port;

            // 3. Gestion du paiement
            if (paymentMethod === 'wallet') {
                const wallet = await Wallet.findOne({ where: { user_id: utilisateur_id }, transaction: t });
                if (!wallet || parseFloat(wallet.solde_virtuel) < total_ttc) {
                    throw new Error('Solde insuffisant dans votre portefeuille BCA.');
                }
                await wallet.decrement('solde_virtuel', { by: total_ttc, transaction: t });
            }

            // Create Order
            const order = await Order.create({
                utilisateur_id,
                total_ttc,
                frais_port,
                statut: paymentMethod === 'wallet' ? 'payé' : 'en_attente_paiement',
                methode_paiement: paymentMethod || 'wallet',
                nom_destinataire: deliveryInfo?.nom,
                telephone_livraison: deliveryInfo?.telephone,
                adresse_livraison: deliveryInfo?.adresse
            }, { transaction: t });

            // Create OrderItems
            for (const item of orderItemsByVendor) {
                await OrderItem.create({
                    ...item,
                    commande_id: order.id
                }, { transaction: t });
            }

            // Create financial Transaction entry
            if (wallet) {
                await Transaction.create({
                    portefeuille_id: wallet.id,
                    commande_id: order.id,
                    montant: total_ttc,
                    type_transaction: 'achat_produit',
                    statut: 'terminé'
                }, { transaction: t });
            }

            await t.commit();

            // ⚡ NOTIFICATIONS TEMPS RÉEL
            const io = req.app.get('socketio');
            if (io) {
                // 1. Notification pour l'acheteur (Confirmation)
                const buyerNotif = await Notification.create({
                    utilisateur_id: utilisateur_id,
                    titre: "Commande confirmée !",
                    message: `Votre commande <span class="font-black text-primary">#${order.id.slice(0, 8)}</span> d'un montant de <span class="italic font-bold text-emerald-600">${total_ttc.toLocaleString('fr-FR')} GNF</span> a été enregistrée.`,
                    type: 'order'
                });
                io.to(utilisateur_id).emit('notification_received', buyerNotif);

                // 2. Notifications pour les vendeurs
                const uniqueVendors = [...new Set(orderItemsByVendor.map(item => item.fournisseur_id))];
                for (const vendorId of uniqueVendors) {
                    const vendorNotif = await Notification.create({
                        utilisateur_id: vendorId,
                        titre: "Nouvelle vente !",
                        message: `Vous avez reçu une nouvelle commande <span class="font-black text-primary">#${order.id.slice(0, 8)}</span>. Veuillez préparer les produits.`,
                        type: 'order'
                    });
                    io.to(vendorId).emit('notification_received', vendorNotif);
                }
            }
            res.status(201).json(order);
        } catch (error) {
            await t.rollback();
            next(error);
        }
    },

    getMyOrders: async (req, res, next) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows: orders } = await Order.findAndCountAll({
                where: { utilisateur_id: req.user.id },
                include: [
                    {
                        model: OrderItem,
                        as: 'details',
                        include: [{ model: Product, as: 'produit' }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                orders
            });
        } catch (error) {
            next(error);
        }
    },

    getOrderById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const order = await Order.findByPk(id, {
                include: [
                    {
                        model: OrderItem,
                        as: 'details',
                        include: [{ model: Product, as: 'produit' }]
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ message: "Commande non trouvée." });
            }

            // Vérifier l'autorisation (Propriétaire, Vendeur concerné ou Admin)
            const isOwner = order.utilisateur_id === req.user.id;
            const isRelatedVendor = order.details.some(item => item.fournisseur_id === req.user.id);
            const isAdmin = req.user.role === 'admin';

            if (!isOwner && !isRelatedVendor && !isAdmin) {
                return res.status(403).json({ message: "Non autorisé à voir cette commande." });
            }

            res.json(order);
        } catch (error) {
            next(error);
        }
    },

    getVendorOrders: async (req, res, next) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows: orders } = await OrderItem.findAndCountAll({
                where: { fournisseur_id: req.user.id },
                include: [
                    {
                        model: Order,
                        as: 'commande',
                        include: [{ model: User, attributes: ['nom_complet', 'telephone', 'email'] }]
                    },
                    { model: Product, as: 'produit' }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                orders
            });
        } catch (error) {
            next(error);
        }
    },

    getAllOrders: async (req, res, next) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows: orders } = await Order.findAndCountAll({
                include: [
                    {
                        model: OrderItem,
                        as: 'details',
                        include: [{ model: Product, as: 'produit' }]
                    },
                    {
                        model: User,
                        attributes: ['nom_complet', 'telephone', 'email']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                orders
            });
        } catch (error) {
            next(error);
        }
    },

    updateItemStatus: async (req, res, next) => {
        try {
            const { itemId } = req.params;
            const { statut, status } = req.body;
            const newStatus = statut || status;
            const fournisseur_id = req.user.id;

            const item = await OrderItem.findByPk(itemId);
            if (!item) {
                return res.status(404).json({ message: "Élément de commande non trouvé." });
            }

            if (item.fournisseur_id !== fournisseur_id && req.user.role !== 'admin') {
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette commande." });
            }

            item.statut = newStatus;
            await item.save();

            // Vérifier si tous les articles de la commande sont préparés pour notifier le transporteur
            const allItems = await OrderItem.findAll({ where: { commande_id: item.commande_id } });
            const allPrepared = allItems.every(i => i.statut === 'prepare');

            if (allPrepared) {
                await Order.update(
                    { statut_livraison: 'pret' },
                    { where: { id: item.commande_id } }
                );
            }

            // ⚡ NOTIFICATION POUR LE CLIENT
            const io = req.app.get('socketio');
            if (io) {
                const order = await Order.findByPk(item.commande_id);
                const statusLabels = {
                    'prepare': 'est en cours de préparation',
                    'expedie': 'a été expédiée',
                    'livre': 'a été livrée',
                    'annule': 'a été annulée'
                };

                const clientNotif = await Notification.create({
                    utilisateur_id: order.utilisateur_id,
                    titre: "Mise à jour de votre commande",
                    message: `L'article <span class="font-bold underline">${item.id.slice(0, 8)}</span> de votre commande <span class="font-black text-primary">#${order.id.slice(0, 8)}</span> ${statusLabels[newStatus] || 'a changé de statut'}.`,
                    type: 'order'
                });
                io.to(order.utilisateur_id).emit('notification_received', clientNotif);
            }

            res.json({
                message: "Statut mis à jour avec succès",
                item,
                orderPrepared: allPrepared
            });
        } catch (error) {
            next(error);
        }
    },

    updateOrderStatus: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { orderId } = req.params;
            const { statut } = req.body;
            const utilisateur_id = req.user.id;

            const order = await Order.findByPk(orderId, {
                transaction: t,
                include: ['details']
            });
            if (!order) {
                await t.rollback();
                return res.status(404).json({ message: "Commande non trouvée." });
            }

            const isAdmin = req.user.role === 'admin';
            const isOwner = order.utilisateur_id === req.user.id;

            // Matrice de transition stricte pour ORDER (Global)
            // payé -> annulé | retourné
            const transitions = {
                'payé': ['annulé', 'retourné'],
                'annulé': [],
                'retourné': []
            };

            if (!transitions[order.statut].includes(statut)) {
                await t.rollback();
                return res.status(400).json({
                    message: `Transition globale invalide: de "${order.statut}" vers "${statut}".`
                });
            }

            // Permissions
            if (statut === 'annulé' && !isOwner && !isAdmin) {
                await t.rollback();
                return res.status(403).json({ message: "Non autorisé à annuler cette commande." });
            }

            // Autoriser uniquement annulation ou demande de retour par le client
            const allowedStatus = ['annulé', 'retourné'];
            if (!allowedStatus.includes(statut)) {
                await t.rollback();
                return res.status(403).json({ message: "Seul l'admin peut initier un retour global." });
            }

            // Si annulation d'une commande déjà payée -> Remboursement
            if (statut === 'annulé' && (order.statut === 'payé' || order.statut === 'en_attente')) {
                const wallet = await Wallet.findOne({ where: { user_id: order.utilisateur_id }, transaction: t });
                if (wallet) {
                    await Transaction.create({
                        portefeuille_id: wallet.id,
                        commande_id: order.id,
                        montant: order.total_ttc,
                        type_transaction: 'remboursement',
                        statut: 'complete',
                        reference_externe: `REFUND-${order.id.slice(0, 8)}`
                    }, { transaction: t });
                }
                // Restaurer stocks
                for (const item of order.details) {
                    await Product.increment('stock_quantite', { by: item.quantite, where: { id: item.produit_id }, transaction: t });
                }
                // Update all items to annulé
                await OrderItem.update({ statut: 'annulé' }, { where: { commande_id: order.id }, transaction: t });
            }

            order.statut = statut;
            await order.save({ transaction: t });

            await t.commit();
            res.json({ message: `Commande passée en état: ${statut}`, order });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }
};

module.exports = orderController;
