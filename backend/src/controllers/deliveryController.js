const { Order, OrderItem, Wallet, Transaction, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const deliveryController = {
    // 1. Lister les commandes disponibles pour ramassage (Transporteur)
    getAvailableOrders: async (req, res, next) => {
        try {
            const orders = await Order.findAll({
                where: {
                    statut_livraison: 'pret',
                    statut: { [Op.or]: ['payé', 'en_préparation'] }
                },
                include: ['details']
            });
            console.log(`DEBUG: Found ${orders.length} available orders for carrier`);
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
            if (!order || order.statut_livraison !== 'pret') {
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

            const order = await Order.findByPk(orderId, {
                transaction: t,
                include: [{ model: OrderItem, as: 'details' }]
            });

            if (!order || order.transporteur_id !== transporteur_id) {
                await t.rollback();
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette commande." });
            }

            order.statut_livraison = status;
            await order.save({ transaction: t });

            // LOGIQUE FINANCIÈRE : Si livré, on libère l'argent du séquestre vers le portefeuille du fournisseur
            if (status === 'livre') {
                for (const item of order.details) {
                    const vendorWallet = await Wallet.findOne({ where: { user_id: item.fournisseur_id }, transaction: t });
                    if (vendorWallet) {
                        const amount = parseFloat(item.prix_unitaire_achat) * item.quantite;

                        // Déduire du séquestre et ajouter au solde réel
                        vendorWallet.solde_sequestre = Math.max(0, parseFloat(vendorWallet.solde_sequestre) - amount);
                        vendorWallet.solde_virtuel = parseFloat(vendorWallet.solde_virtuel) + amount;
                        await vendorWallet.save({ transaction: t });

                        // Créer une transaction de type 'vente_encaissement'
                        await Transaction.create({
                            portefeuille_id: vendorWallet.id,
                            commande_id: order.id,
                            montant: amount,
                            type_transaction: 'achat', // Correspond au type utilisé par le frontend pour afficher l'icône vente
                            statut: 'complete',
                            reference_externe: `RELCASH-${order.id.slice(0, 8)}-${item.id.slice(0, 4)}`,
                            metadata: { type: 'release_escrow', item_id: item.id }
                        }, { transaction: t });
                    }
                }
            }

            await t.commit();
            res.json({ message: `Statut mis à jour : ${status}`, order });
        } catch (error) {
            if (t) await t.rollback();
            next(error);
        }
    }
};

module.exports = deliveryController;
