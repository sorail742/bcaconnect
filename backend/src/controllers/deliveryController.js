const { Order, User, sequelize } = require('../models');

const deliveryController = {
    // 1. Lister les commandes disponibles pour ramassage (Transporteur)
    getAvailableOrders: async (req, res, next) => {
        try {
            const orders = await Order.findAll({
                where: {
                    statut_livraison: 'en_attente',
                    statut: 'payé'
                },
                include: ['details']
            });
            res.json(orders);
        } catch (error) {
            next(error);
        }
    },

    // 2. Accepter une livraison
    assignOrder: async (req, res, next) => {
        try {
            const { orderId } = req.body;
            const transporteur_id = req.user.id;

            const order = await Order.findByPk(orderId);
            if (!order || order.statut_livraison !== 'en_attente') {
                return res.status(400).json({ message: "Commande non disponible pour livraison." });
            }

            order.transporteur_id = transporteur_id;
            order.statut_livraison = 'ramasse';
            await order.save();

            res.json({ message: "Commande assignée avec succès", order });
        } catch (error) {
            next(error);
        }
    },

    // 3. Mettre à jour le statut de livraison (Livré !)
    updateStatus: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { orderId, status } = req.body; // 'en_cours', 'livre'
            const transporteur_id = req.user.id;

            const order = await Order.findByPk(orderId, { transaction: t });
            if (!order || order.transporteur_id !== transporteur_id) {
                await t.rollback();
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette commande." });
            }

            order.statut_livraison = status;
            await order.save({ transaction: t });

            // LOGIQUE FINANCIÈRE : Si livré, on libère l'argent du séquestre vers le portefeuille du fournisseur
            if (status === 'livre') {
                // Pour simplifier le MVP, on considère que l'argent est libéré.
                // Dans une version complète, on ferait un transfert interne de Wallet Acheteur -> Wallet Vendeur.
            }

            await t.commit();
            res.json({ message: `Statut mis à jour : ${status}`, order });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }
};

module.exports = deliveryController;
