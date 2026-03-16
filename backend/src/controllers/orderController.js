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
                        as: 'commande',
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
    }
};

module.exports = orderController;
