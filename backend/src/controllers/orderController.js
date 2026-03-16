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

            // Create Order
            const order = await Order.create({
                utilisateur_id,
                total_ttc,
                statut: 'payé'
            }, { transaction: t });

            // Create OrderItems
            for (const item of orderItems) {
                await OrderItem.create({
                    ...item,
                    commande_id: order.id
                }, { transaction: t });
            }

            // Create financial Transaction entry
            const wallet = await Wallet.findOne({ where: { user_id: utilisateur_id }, transaction: t });
            if (wallet) {
                await Transaction.create({
                    portefeuille_id: wallet.id,
                    commande_id: order.id,
                    montant: total_ttc,
                    type_transaction: 'debit_achat',
                    reference_externe: `ORD-${order.id.slice(0, 8)}`
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
            const orders = await Order.findAll({
                where: { utilisateur_id: req.user.id },
                include: ['details']
            });
            res.json(orders);
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
            next(error);
        }
    },

    updateOrderStatus: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { orderId } = req.params;
            const { statut } = req.body;
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
            if (!allowedStatus.includes(statut)) {
                await t.rollback();
                return res.status(400).json({ message: "Statut non autorisé pour une mise à jour client." });
            }

            // Si annulation d'une commande déjà payée -> Remboursement
            if (statut === 'annulé' && (order.statut === 'payé' || order.statut === 'en_attente')) {
                const wallet = await Wallet.findOne({ where: { user_id: order.utilisateur_id }, transaction: t });
                if (wallet) {
                    await Transaction.create({
                        portefeuille_id: wallet.id,
                        commande_id: order.id,
                        montant: order.total_ttc,
                        type_transaction: 'credit_remboursement',
                        reference_externe: `REFUND-${order.id.slice(0, 8)}`
                    }, { transaction: t });
                }
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
