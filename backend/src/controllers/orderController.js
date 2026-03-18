const { Order, OrderItem, Product, Wallet, Transaction, User, sequelize } = require('../models');

const orderController = {
    create: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { items, cle_idempotence } = req.body; // Array of { productId, quantity }
            const utilisateur_id = req.user.id;

            // 1. Vérification Idempotence
            if (cle_idempotence) {
                const existingOrder = await Order.findOne({ where: { cle_idempotence }, transaction: t });
                if (existingOrder) {
                    await t.rollback();
                    return res.status(200).json(existingOrder); // Retourne la commande existante sans erreur (Idempotence)
                }
            }

            let total_ttc = 0;
            const orderItemsByVendor = [];

            for (const item of items) {
                // Stock check with LOCK to prevent race conditions
                const product = await Product.findByPk(item.productId, {
                    lock: t.LOCK.UPDATE,
                    transaction: t
                });

                if (!product) {
                    throw new Error(`Produit ${item.productId} non trouvé.`);
                }

                if (product.stock_quantite < item.quantity) {
                    throw new Error(`Stock insuffisant pour le produit: ${product.nom_produit}.`);
                }

                const subtotal = product.prix_unitaire * item.quantity;
                total_ttc += parseFloat(subtotal);

                const store = await product.getStore({ transaction: t });

                orderItemsByVendor.push({
                    produit_id: product.id,
                    fournisseur_id: store.proprietaire_id,
                    quantite: item.quantity,
                    prix_unitaire_achat: product.prix_unitaire, // Prix figé au moment de la commande
                    statut: 'en_attente'
                });

                // Update stock
                await product.decrement('stock_quantite', { by: item.quantity, transaction: t });
            }

            // Verify wallet balance
            const wallet = await Wallet.findOne({ where: { user_id: utilisateur_id }, transaction: t });
            if (!wallet || parseFloat(wallet.solde_virtuel) < total_ttc) {
                throw new Error('Solde insuffisant dans votre portefeuille BCA.');
            }

            // Create Order
            const { deliveryInfo } = req.body;
            const order = await Order.create({
                utilisateur_id,
                total_ttc,
                statut: 'payé',
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
                    statut: 'en_attente'
                }, { transaction: t });
            }

            await t.commit();
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
            const { statut } = req.body;
            const fournisseur_id = req.user.id;

            const item = await OrderItem.findByPk(itemId);
            if (!item) {
                return res.status(404).json({ message: "Élément de commande non trouvé." });
            }

            if (item.fournisseur_id !== fournisseur_id && req.user.role !== 'admin') {
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette commande." });
            }

            item.statut = statut;
            await item.save();

            res.json({ message: "Statut mis à jour avec succès", item });
        } catch (error) {
            await t.rollback();
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
