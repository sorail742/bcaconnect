const { Op } = require('sequelize');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
// NOTE: Product/ProductVariant/Store/User/Notification/DeliveryLog appartiennent à
// des features distinctes (product/store déjà migrées, les autres pas encore) —
// tant qu'elles n'exposent pas toutes un repository dédié pour ces besoins précis,
// leur accès Sequelize reste ici plutôt que dans order.service.js.
const { Product, ProductVariant, Store, User, Notification, DeliveryLog } = require('../../models');

const orderRepository = {
    // ── Order ────────────────────────────────────────────────────────────
    findByCleIdempotence(cle, transaction) {
        return Order.findOne({ where: { cle_idempotence: cle }, transaction });
    },

    create(data, { transaction } = {}) {
        return Order.create(data, { transaction });
    },

    save(order, { transaction } = {}) {
        return order.save({ transaction });
    },

    findById(id, opts = {}) {
        return Order.findByPk(id, opts);
    },

    // Utilisé par la feature `payment` pour valider qu'une commande à payer
    // appartient bien à l'utilisateur qui initie le paiement.
    findByIdForUser(orderId, userId) {
        return Order.findOne({ where: { id: orderId, utilisateur_id: userId } });
    },

    findByIdWithDetails(id, { transaction } = {}) {
        return Order.findByPk(id, { transaction, include: ['details'] });
    },

    findByIdWithItemsProductsStoreAndClient(id) {
        return Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: 'details',
                    include: [{
                        model: Product,
                        as: 'produit',
                        include: [{ model: Store, as: 'boutique', attributes: ['id', 'nom_boutique', 'logo_url'] }],
                    }]
                },
                { model: User, as: 'client', attributes: ['id', 'nom_complet', 'email', 'telephone'] },
            ]
        });
    },

    findByIdWithClientAndTransporteur(id, attributes) {
        return Order.findByPk(id, {
            attributes,
            include: [
                { model: User, as: 'client', attributes: ['id', 'nom_complet', 'telephone', 'email'] },
                { model: User, as: 'transporteur', attributes: ['id', 'nom_complet', 'telephone', 'location'] },
            ],
        });
    },

    findAndCountAllByUser(userId, { limit, offset }) {
        return Order.findAndCountAll({
            where: { utilisateur_id: userId },
            include: [
                {
                    model: OrderItem,
                    as: 'details',
                    include: [{
                        model: Product, as: 'produit',
                        include: [{ model: Store, as: 'boutique', attributes: ['id', 'nom_boutique', 'proprietaire_id'] }],
                    }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
    },

    findAndCountAllAdmin({ limit, offset }) {
        return Order.findAndCountAll({
            include: [
                {
                    model: OrderItem,
                    as: 'details',
                    include: [{ model: Product, as: 'produit' }]
                },
                {
                    model: User,
                    as: 'client',
                    attributes: ['nom_complet', 'telephone', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
    },

    // ── OrderItem ────────────────────────────────────────────────────────
    createItem(data, { transaction } = {}) {
        return OrderItem.create(data, { transaction });
    },

    findItemsByOrderId(orderId, { transaction } = {}) {
        return OrderItem.findAll({ where: { commande_id: orderId }, transaction });
    },

    findItemById(id, { transaction } = {}) {
        return OrderItem.findByPk(id, { transaction });
    },

    saveItem(item, { transaction } = {}) {
        return item.save({ transaction });
    },

    updateItemsStatus(commandeId, statut, { transaction } = {}) {
        return OrderItem.update({ statut }, { where: { commande_id: commandeId }, transaction });
    },

    findAndCountAllByVendor(vendorId, { limit, offset }) {
        return OrderItem.findAndCountAll({
            where: { fournisseur_id: vendorId },
            include: [
                {
                    model: Order,
                    as: 'commande',
                    attributes: [
                        'id', 'statut', 'statut_livraison', 'transporteur_id',
                        'frais_port', 'type_livraison', 'methode_paiement',
                        'nom_destinataire', 'adresse_livraison', 'date_commande', 'total_ttc',
                    ],
                    include: [
                        { model: User, as: 'client', attributes: ['id', 'nom_complet', 'telephone', 'email'] },
                        { model: User, as: 'transporteur', attributes: ['id', 'nom_complet', 'telephone', 'location'] },
                    ],
                },
                { model: Product, as: 'produit' },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
    },

    countItemsByOrderAndVendor(orderId, vendorId) {
        return OrderItem.count({ where: { commande_id: orderId, fournisseur_id: vendorId } });
    },

    findItemsByOrderAndVendor(orderId, vendorId, { transaction } = {}) {
        return OrderItem.findAll({ where: { commande_id: orderId, fournisseur_id: vendorId }, transaction });
    },

    findItemsForUserVendorsMap(userId) {
        return OrderItem.findAll({
            attributes: ['id'],
            include: [
                { model: Order, as: 'commande', attributes: [], required: true, where: { utilisateur_id: userId } },
                {
                    model: Product, as: 'produit', attributes: ['id'], required: true,
                    include: [{ model: Store, as: 'boutique', attributes: ['id', 'nom_boutique', 'slug', 'logo_url', 'localisation', 'proprietaire_id', 'categorie_principale', 'is_verified'] }],
                },
            ],
        });
    },

    // ── Lectures/écritures inter-features utilisées par le flux commande ──
    findVariantForUpdate(variantId, transaction) {
        return ProductVariant.findByPk(variantId, { lock: transaction?.LOCK?.UPDATE, transaction });
    },

    findUsersByIds(ids, attributes) {
        return User.findAll({ where: { id: { [Op.in]: ids } }, attributes });
    },

    createNotification(data) {
        return Notification.create(data);
    },

    findDeliveryLogsByOrderId(orderId) {
        return DeliveryLog.findAll({ where: { order_id: orderId }, order: [['created_at', 'ASC']] });
    },
};

module.exports = orderRepository;
