const { Op } = require('sequelize');
const sequelize = require('../config/database');
const refreshTokenService = require('./refreshTokenService');
const {
    User,
    Wallet,
    Store,
    Product,
    Order,
    OrderItem,
    Transaction,
    AuditLog,
    SyncQueue,
    Publicite,
    PubliciteCiblage,
    PubliciteStat,
    PaiementPublicite,
    Litige,
    LitigeEvenement,
    Credit,
    Echeancier,
    DeliveryLog,
    Ticket,
    Review,
    Notification,
    Message,
    ConversationParticipant,
    Conversation,
    Guarantee,
    Intervention,
    AchatGroupe,
    AchatGroupeParticipant,
    IoTTrackingLog,
    BlockchainTransactionStub,
} = require('../models');

const deleteOrderTree = async (orderId, transaction) => {
    const opts = { transaction };

    const litiges = await Litige.findAll({ where: { commande_id: orderId }, ...opts });
    for (const litige of litiges) {
        await LitigeEvenement.destroy({ where: { litige_id: litige.id }, ...opts });
    }
    await Litige.destroy({ where: { commande_id: orderId }, ...opts });

    const guarantees = await Guarantee.findAll({ where: { commande_id: orderId }, ...opts });
    for (const g of guarantees) {
        await Intervention.destroy({ where: { guarantee_id: g.id }, ...opts });
    }
    await Guarantee.destroy({ where: { commande_id: orderId }, ...opts });

    await Ticket.destroy({ where: { commande_id: orderId }, ...opts });
    await Review.destroy({ where: { commande_id: orderId }, ...opts });
    await IoTTrackingLog.destroy({ where: { commande_id: orderId }, ...opts });
    await BlockchainTransactionStub.destroy({ where: { commande_id: orderId }, ...opts });
    await DeliveryLog.destroy({ where: { order_id: orderId }, ...opts });

    const credits = await Credit.findAll({ where: { commande_id: orderId }, ...opts });
    for (const credit of credits) {
        await Echeancier.destroy({ where: { credit_id: credit.id }, ...opts });
    }
    await Credit.destroy({ where: { commande_id: orderId }, ...opts });

    await AchatGroupeParticipant.destroy({ where: { commande_id: orderId }, ...opts });
    await Transaction.destroy({ where: { commande_id: orderId }, ...opts });
    await OrderItem.destroy({ where: { commande_id: orderId }, ...opts });
    await Order.destroy({ where: { id: orderId }, ...opts });
};

const deleteUserCompletely = async (userId) => {
    const transaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return { ok: false, status: 404, message: 'Utilisateur non trouvé.' };
        }

        const opts = { transaction };

        await refreshTokenService.revokeAllTokens(userId);

        await Message.destroy({ where: { expediteur_id: userId }, ...opts });

        const participations = await ConversationParticipant.findAll({
            where: { user_id: userId },
            ...opts,
        });
        const conversationIds = participations.map((p) => p.conversation_id);
        await ConversationParticipant.destroy({ where: { user_id: userId }, ...opts });

        for (const conversationId of conversationIds) {
            const remaining = await ConversationParticipant.count({
                where: { conversation_id: conversationId },
                ...opts,
            });
            if (remaining === 0) {
                await Message.destroy({ where: { conversation_id: conversationId }, ...opts });
                await Conversation.destroy({ where: { id: conversationId }, ...opts });
            }
        }

        await Notification.destroy({ where: { utilisateur_id: userId }, ...opts });
        await Review.destroy({ where: { utilisateur_id: userId }, ...opts });
        await AuditLog.destroy({ where: { utilisateur_id: userId }, ...opts });
        await SyncQueue.destroy({ where: { utilisateur_id: userId }, ...opts });
        await Ticket.destroy({ where: { utilisateur_id: userId }, ...opts });
        await PaiementPublicite.destroy({ where: { utilisateur_id: userId }, ...opts });

        const publicites = await Publicite.findAll({ where: { vendeur_id: userId }, ...opts });
        for (const pub of publicites) {
            await PubliciteStat.destroy({ where: { publicite_id: pub.id }, ...opts });
            await PubliciteCiblage.destroy({ where: { publicite_id: pub.id }, ...opts });
            await PaiementPublicite.destroy({ where: { publicite_id: pub.id }, ...opts });
        }
        await Publicite.destroy({ where: { vendeur_id: userId }, ...opts });

        await LitigeEvenement.destroy({ where: { auteur_id: userId }, ...opts });

        const litiges = await Litige.findAll({
            where: { [Op.or]: [{ demandeur_id: userId }, { defenseur_id: userId }] },
            ...opts,
        });
        for (const litige of litiges) {
            await LitigeEvenement.destroy({ where: { litige_id: litige.id }, ...opts });
        }
        await Litige.destroy({
            where: { [Op.or]: [{ demandeur_id: userId }, { defenseur_id: userId }] },
            ...opts,
        });

        await Intervention.destroy({
            where: { [Op.or]: [{ demandeur_id: userId }, { technicien_id: userId }] },
            ...opts,
        });

        const garanties = await Guarantee.findAll({ where: { acheteur_id: userId }, ...opts });
        for (const g of garanties) {
            await Intervention.destroy({ where: { guarantee_id: g.id }, ...opts });
        }
        await Guarantee.destroy({ where: { acheteur_id: userId }, ...opts });

        await AchatGroupeParticipant.destroy({ where: { utilisateur_id: userId }, ...opts });
        const campagnes = await AchatGroupe.findAll({ where: { organisateur_id: userId }, ...opts });
        for (const campagne of campagnes) {
            await AchatGroupeParticipant.destroy({ where: { achat_groupe_id: campagne.id }, ...opts });
        }
        await AchatGroupe.destroy({ where: { organisateur_id: userId }, ...opts });

        const credits = await Credit.findAll({ where: { utilisateur_id: userId }, ...opts });
        for (const credit of credits) {
            await Echeancier.destroy({ where: { credit_id: credit.id }, ...opts });
        }
        await Credit.destroy({ where: { utilisateur_id: userId }, ...opts });

        const clientOrders = await Order.findAll({ where: { utilisateur_id: userId }, ...opts });
        for (const order of clientOrders) {
            await deleteOrderTree(order.id, transaction);
        }

        await Order.update({ transporteur_id: null }, { where: { transporteur_id: userId }, ...opts });
        await OrderItem.update({ fournisseur_id: null }, { where: { fournisseur_id: userId }, ...opts });

        const store = await Store.findOne({ where: { proprietaire_id: userId }, ...opts });
        if (store) {
            const products = await Product.findAll({ where: { boutique_id: store.id }, ...opts });
            const productIds = products.map((p) => p.id);

            if (productIds.length) {
                const groupPurchases = await AchatGroupe.findAll({
                    where: { produit_id: { [Op.in]: productIds } },
                    ...opts,
                });
                for (const gp of groupPurchases) {
                    await AchatGroupeParticipant.destroy({ where: { achat_groupe_id: gp.id }, ...opts });
                }
                await AchatGroupe.destroy({ where: { produit_id: { [Op.in]: productIds } }, ...opts });

                for (const productId of productIds) {
                    await Review.destroy({ where: { produit_id: productId }, ...opts });
                    await Guarantee.destroy({ where: { produit_id: productId }, ...opts });
                    await Intervention.destroy({ where: { produit_id: productId }, ...opts });
                }
                await Product.destroy({ where: { boutique_id: store.id }, ...opts });
            }
            await Store.destroy({ where: { id: store.id }, ...opts });
        }

        const wallet = await Wallet.findOne({ where: { user_id: userId }, ...opts });
        if (wallet) {
            await Transaction.destroy({ where: { portefeuille_id: wallet.id }, ...opts });
            await Wallet.destroy({ where: { id: wallet.id }, ...opts });
        }

        await User.destroy({ where: { id: userId }, ...opts });

        await transaction.commit();
        return { ok: true, message: 'Utilisateur supprimé définitivement.' };
    } catch (error) {
        await transaction.rollback();
        console.error('Erreur suppression utilisateur:', error);
        return {
            ok: false,
            status: 500,
            message: 'Impossible de supprimer cet utilisateur (données liées). Contactez le support technique.',
            error,
        };
    }
};

module.exports = { deleteUserCompletely, deleteOrderTree };
