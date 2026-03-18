const { Order, OrderItem, Product, Wallet, Transaction, sequelize } = require('../models');

const orderController = {
    create: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { items } = req.body; // Array of { productId, quantity }
            const utilisateur_id = req.user.id;

            let total_ttc = 0;
            const orderItems = [];

            for (const item of items) {
                const product = await Product.findByPk(item.productId);
                if (!product || product.stock_quantite < item.quantity) {
                    throw new Error(`Produit ${item.productId} non disponible ou stock insuffisant.`);
                }

                const subtotal = product.prix_unitaire * item.quantity;
                total_ttc += parseFloat(subtotal);

                orderItems.push({
                    produit_id: product.id,
                    fournisseur_id: (await product.getStore({ transaction: t })).proprietaire_id,
                    quantite: item.quantity,
                    prix_unitaire_achat: product.prix_unitaire
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
            const order = await Order.create({
                utilisateur_id,
                total_ttc,
                statut: 'payé',
                statut_livraison: 'en_attente'
            }, { transaction: t });

            // Deduct from buyer's wallet
            wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) - total_ttc;
            await wallet.save({ transaction: t });

            // Record transaction for buyer
            await Transaction.create({
                portefeuille_id: wallet.id,
                commande_id: order.id,
                montant: total_ttc,
                type_transaction: 'achat',
                statut: 'complete',
                reference_externe: `ORD-${order.id.slice(0, 8)}`,
                metadata: { type: 'achat_marketplace' }
            }, { transaction: t });

            // Create OrderItems and handle vendor escrow
            for (const item of orderItems) {
                await OrderItem.create({
                    ...item,
                    commande_id: order.id,
                    statut: 'en_attente'
                }, { transaction: t });

                // Credit vendor's escrow account
                const vendorWallet = await Wallet.findOne({ where: { user_id: item.fournisseur_id }, transaction: t });
                if (vendorWallet) {
                    const itemAmount = parseFloat(item.prix_unitaire_achat) * item.quantite;
                    vendorWallet.solde_sequestre = parseFloat(vendorWallet.solde_sequestre) + itemAmount;
                    await vendorWallet.save({ transaction: t });

                    // Transaction record for vendor (optional: to track pending funds)
                    await Transaction.create({
                        portefeuille_id: vendorWallet.id,
                        commande_id: order.id,
                        montant: itemAmount,
                        type_transaction: 'vente_sequestre',
                        statut: 'en_attente',
                        reference_externe: `ESCROW-${order.id.slice(0, 8)}-${item.produit_id.slice(0, 4)}`,
                        metadata: { type: 'vente_attente_livraison', product_id: item.produit_id }
                    }, { transaction: t });
                }
            }

            await t.commit();
            res.status(201).json(order);
        } catch (error) {
            if (t) await t.rollback();
            res.status(400).json({ message: error.message });
        }
    },

    getMyOrders: async (req, res, next) => {
        try {
            const orders = await Order.findAll({
                where: { utilisateur_id: req.user.id },
                include: ['details']
            });
            res.json(orders);
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
            const orders = await OrderItem.findAll({
                where: { fournisseur_id: req.user.id },
                include: [
                    {
                        model: Order,
                        include: [{ model: User, attributes: ['nom_complet', 'telephone'] }]
                    },
                    { model: Product, as: 'produit' }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json(orders);
        } catch (error) {
            next(error);
        }
    },

    updateItemStatus: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { itemId } = req.params;
            const { statut, status } = req.body;
            const finalStatut = statut || status;
            const fournisseur_id = req.user.id;

            const item = await OrderItem.findByPk(itemId, {
                include: [{ model: Order, as: 'Order' }, { model: Product, as: 'produit' }]
            });

            if (!item) {
                await t.rollback();
                return res.status(404).json({ message: "Élément de commande non trouvé." });
            }

            // Vérification de l'autorisation
            if (item.fournisseur_id !== fournisseur_id && req.user.role !== 'admin') {
                await t.rollback();
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette commande." });
            }

            // Validation sommaire des transitions (ex: ne pas revenir en arrière depuis 'livre')
            const statusFlow = ['en_attente', 'confirme', 'prepare', 'expedie', 'livre'];
            const currentIndex = statusFlow.indexOf(item.statut);
            const nextIndex = statusFlow.indexOf(finalStatut);
            if (nextIndex <= currentIndex && finalStatut !== 'annule') {
                // On autorise l'annulation à tout moment (sauf si déjà livré)
                if (item.statut !== 'livre') {
                    // Autoriser l'annulation
                } else {
                    await t.rollback();
                    return res.status(400).json({ message: "Transition de statut invalide." });
                }
            }

            item.statut = finalStatut;
            await item.save({ transaction: t });

            // Mettre à jour l'état de la commande globale si nécessaire
            const order = await Order.findByPk(item.commande_id, {
                include: [{ model: OrderItem, as: 'details' }],
                transaction: t
            });

            // Mise à jour de l'item dans la collection locale pour la vérification allReady
            order.details.forEach(detail => {
                if (detail.id === item.id) {
                    detail.statut = finalStatut;
                }
            });

            // Si au moins un item est confirmé, la commande passe en préparation
            if (finalStatut === 'confirme' && order.statut === 'payé') {
                order.statut = 'en_préparation';
                await order.save({ transaction: t });
            }

            // Si TOUS les items sont 'prepare' (ou plus), la livraison passe à 'pret'
            const allReady = order.details.every(i => ['prepare', 'expedie', 'livre'].includes(i.statut));

            if (allReady && (order.statut_livraison === 'en_attente' || order.statut_livraison === 'pret')) {
                order.statut_livraison = 'pret';
                await order.save({ transaction: t });
            }

            // Si TOUS les items sont livrés, la commande globale est terminée
            const allDelivered = order.details.every(i => i.statut === 'livre');
            if (allDelivered) {
                order.statut = 'complétée';
                order.statut_livraison = 'livre';
                await order.save({ transaction: t });
            }

            await t.commit();
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
            const { statut, status } = req.body;
            const finalStatut = statut || status;
            const utilisateur_id = req.user.id;

            const order = await Order.findByPk(orderId, { transaction: t });
            if (!order) {
                await t.rollback();
                return res.status(404).json({ message: "Commande non trouvée." });
            }

            if (order.utilisateur_id !== utilisateur_id && req.user.role !== 'admin') {
                await t.rollback();
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette commande." });
            }

            // Autoriser uniquement annulation ou demande de retour par le client
            const allowedStatus = ['annulé', 'retourné'];
            if (!allowedStatus.includes(finalStatut)) {
                await t.rollback();
                return res.status(400).json({ message: "Statut non autorisé pour une mise à jour client." });
            }

            // Si annulation d'une commande déjà payée -> Remboursement
            if (finalStatut === 'annulé' && order.statut === 'payé') {
                const wallet = await Wallet.findOne({ where: { user_id: order.utilisateur_id }, transaction: t });
                if (wallet) {
                    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + parseFloat(order.total_ttc);
                    await wallet.save({ transaction: t });

                    await Transaction.create({
                        portefeuille_id: wallet.id,
                        commande_id: order.id,
                        montant: order.total_ttc,
                        type_transaction: 'remboursement',
                        statut: 'complete',
                        reference_externe: `REFUND-${order.id.slice(0, 8)}`
                    }, { transaction: t });
                }
            }

            order.statut = finalStatut;
            await order.save({ transaction: t });

            await t.commit();
            res.json({ message: `Commande passée en état: ${finalStatut}`, order });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }
};

module.exports = orderController;
