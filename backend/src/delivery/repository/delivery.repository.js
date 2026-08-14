const { Op, where, fn, col, cast } = require('sequelize');
const DeliveryLog = require('../models/deliveryLog.model');
const DeliveryGroup = require('../models/deliveryGroup.model');
// NOTE: Order/OrderItem appartiennent à la feature `order` (déjà migrée) mais la
// plupart des requêtes ci-dessous sont trop spécifiques à la logistique pour
// vivre dans order.repository.js — même logique que order.repository.js lisant
// Product directement. User/Notification/Guarantee restent ici pour la même
// raison (Notification pas encore migrée, Guarantee/User n'exposent pas ces formes).
const Order = require('../../order/models/order.model');
const OrderItem = require('../../order/models/orderItem.model');
const Guarantee = require('../../sav/models/guarantee.model');
const { User, Product, Store, Notification } = require('../../models');
const { carrierAvailableWhere } = require('../../utils/deliveryEligibility');

const deliveryRepository = {
    // ── Orders (lecture/écriture logistique) ────────────────────────────
    findAvailableOrders() {
        return Order.findAll({
            where: carrierAvailableWhere(),
            include: [
                {
                    model: OrderItem,
                    as: 'details',
                    include: [{
                        model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'image_url'],
                        include: [{ model: Store, as: 'boutique', attributes: ['id', 'nom_boutique', 'localisation'] }],
                    }],
                },
            ],
            order: [['created_at', 'DESC']],
        });
    },

    findOrderById(id, opts = {}) {
        return Order.findByPk(id, opts);
    },

    findOrderWithDetails(id, { transaction } = {}) {
        return Order.findByPk(id, { transaction, include: [{ model: OrderItem, as: 'details' }] });
    },

    saveOrder(order, { transaction } = {}) {
        return order.save({ transaction });
    },

    updateOrderDeliveryStatus(orderId, statut_livraison) {
        return Order.update({ statut_livraison }, { where: { id: orderId } });
    },

    bulkUpdateOrderItemsStatus(orderId, statut, statutIn, { transaction } = {}) {
        return OrderItem.update(
            { statut },
            { where: { commande_id: orderId, statut: { [Op.in]: statutIn } }, transaction },
        );
    },

    bulkUpdateOrderItemsStatusExcluding(orderId, statut, statutNe, { transaction } = {}) {
        return OrderItem.update(
            { statut },
            { where: { commande_id: orderId, statut: { [Op.ne]: statutNe } }, transaction },
        );
    },

    countVendorItemsForOrder(orderId, vendorId) {
        return OrderItem.count({ where: { commande_id: orderId, fournisseur_id: vendorId } });
    },

    findOrdersByTransporteurActive(transporteur_id) {
        return Order.findAll({
            where: {
                transporteur_id,
                statut_livraison: { [Op.ne]: 'livre' }
            },
            include: [
                {
                    model: OrderItem,
                    as: 'details',
                    include: [{
                        model: Product, as: 'produit',
                        include: [{ model: Store, as: 'boutique', attributes: ['id', 'nom_boutique', 'localisation'] }],
                    }]
                },
                {
                    model: User,
                    as: 'client',
                    attributes: ['nom_complet', 'telephone', 'email']
                }
            ],
            order: [['updated_at', 'DESC']]
        });
    },

    findOrdersForRouteOptimization(transporteur_id) {
        return Order.findAll({
            where: {
                transporteur_id,
                statut_livraison: { [Op.ne]: 'livre' },
            },
            attributes: ['id', 'adresse_livraison', 'nom_destinataire', 'statut_livraison'],
            order: [['updated_at', 'DESC']],
        });
    },

    findCompletedDeliveries(transporteur_id, limit = 50) {
        return Order.findAll({
            where: { transporteur_id, statut_livraison: 'livre' },
            attributes: ['id', 'adresse_livraison', 'frais_port', 'nom_destinataire', 'updated_at', 'date_commande'],
            order: [['updated_at', 'DESC']],
            limit,
        });
    },

    findOrderByExactId(id) {
        return Order.findByPk(id);
    },

    findOrderByIdPrefix(prefix) {
        return Order.findOne({
            where: where(
                fn('LOWER', cast(col('id'), 'TEXT')),
                { [Op.like]: `${prefix}%` },
            ),
        });
    },

    findOrdersByIdsAvailable(orderIds, { transaction } = {}) {
        return Order.findAll({
            where: {
                id: { [Op.in]: orderIds },
                ...carrierAvailableWhere(),
            },
            transaction,
        });
    },

    findGroupsByTransporteur(transporteur_id) {
        return DeliveryGroup.findAll({
            where: { transporteur_id },
            include: [{
                model: Order,
                as: 'commandes',
                include: [
                    {
                        model: OrderItem,
                        as: 'details',
                        include: [{ model: Product, as: 'produit' }]
                    },
                    {
                        model: User,
                        as: 'client',
                        attributes: ['nom_complet', 'telephone', 'adresse']
                    }
                ]
            }],
            order: [['created_at', 'DESC']]
        });
    },

    findGroupByIdForTransporteur(groupId, transporteur_id) {
        return DeliveryGroup.findOne({ where: { id: groupId, transporteur_id } });
    },

    findOrdersByGroupActive(groupId) {
        return Order.findAll({
            where: { delivery_group_id: groupId, statut_livraison: { [Op.notIn]: ['livre', 'annule'] } },
            attributes: ['id', 'adresse_livraison']
        });
    },

    createGroup(data, { transaction } = {}) {
        return DeliveryGroup.create(data, { transaction });
    },

    countGroupsByTransporteur(transporteur_id) {
        return DeliveryGroup.count({ where: { transporteur_id } });
    },

    sumGroupCo2ByTransporteur(transporteur_id) {
        return DeliveryGroup.sum('co2_saved', { where: { transporteur_id } });
    },

    // ── Admin overview / carrier stats (comptages) ───────────────────────
    countOrders(where) {
        return Order.count({ where });
    },

    findTransporteurs() {
        return User.findAll({
            where: { role: 'transporteur' },
            attributes: ['id', 'nom_complet', 'email', 'telephone', 'location', 'metadata_transporteur', 'statut'],
        });
    },

    findActiveOrdersWithParties(limit = 30) {
        return Order.findAll({
            where: { statut_livraison: { [Op.in]: ['ramasse', 'en_route', 'en_cours'] } },
            attributes: ['id', 'adresse_livraison', 'statut_livraison', 'frais_port', 'transporteur_id', 'updated_at'],
            include: [
                { model: User, as: 'transporteur', attributes: ['id', 'nom_complet'] },
                { model: User, as: 'client', attributes: ['id', 'nom_complet'] },
            ],
            order: [['updated_at', 'DESC']],
            limit,
        });
    },

    findPendingOrders(limit = 20) {
        return Order.findAll({
            where: carrierAvailableWhere(),
            attributes: ['id', 'adresse_livraison', 'frais_port', 'type_livraison', 'created_at'],
            order: [['created_at', 'DESC']],
            limit,
        });
    },

    // ── DeliveryLog ──────────────────────────────────────────────────────
    createLog(data, { transaction } = {}) {
        return DeliveryLog.create(data, { transaction });
    },

    findLogsByOrder(orderId) {
        return DeliveryLog.findAll({ where: { order_id: orderId }, order: [['created_at', 'ASC']] });
    },

    findLastGpsLogForOrder(orderId) {
        return DeliveryLog.findOne({
            where: { order_id: orderId, latitude: { [Op.ne]: null } },
            order: [['created_at', 'DESC']],
        });
    },

    // ── Traversées inter-features (User, Notification, Guarantee) ───────
    updateUserLocation(userId, point) {
        return User.update({ location: point }, { where: { id: userId } });
    },

    createNotification(data, { transaction } = {}) {
        return Notification.create(data, { transaction });
    },

    findOrCreateGuarantee(where, defaults, { transaction } = {}) {
        return Guarantee.findOrCreate({ where, defaults, transaction });
    },
};

module.exports = deliveryRepository;
