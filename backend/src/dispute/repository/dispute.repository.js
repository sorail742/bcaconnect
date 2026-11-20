const { Op } = require('sequelize');
const Litige = require('../models/litige.model');
const LitigeEvenement = require('../models/litigeEvenement.model');
// NOTE: User/Order sont déjà migrées mais n'exposent pas ces formes d'include
// précises ; Notification ne l'est pas encore.
const { User, Order, Notification } = require('../../models');
const orderRepository = require('../../order/repository/order.repository');

const disputeIncludes = [
    { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'role'] },
    { model: User, as: 'defenseur', attributes: ['id', 'nom_complet', 'role'] },
    { model: Order, attributes: ['id', 'total_ttc', 'statut', 'statut_livraison'] },
    {
        model: LitigeEvenement,
        as: 'evenements',
        include: [{ model: User, as: 'auteur', attributes: ['id', 'nom_complet', 'role'] }],
        separate: true,
        order: [['created_at', 'ASC']],
    },
];

const disputeRepository = {
    findOrderWithDetails(orderId, opts) {
        return orderRepository.findByIdWithDetails(orderId, opts);
    },

    saveOrder(order, opts) {
        return orderRepository.save(order, opts);
    },

    findActiveByOrder(orderId, activeStatuses) {
        return Litige.findOne({
            where: { commande_id: orderId, statut: { [Op.in]: activeStatuses } },
        });
    },

    create(data, { transaction } = {}) {
        return Litige.create(data, { transaction });
    },

    findFull(id) {
        return Litige.findByPk(id, { include: disputeIncludes });
    },

    findById(id, { transaction } = {}) {
        return Litige.findByPk(id, { transaction });
    },

    save(litige, { transaction } = {}) {
        return litige.save({ transaction });
    },

    findAllForUser(userId) {
        return Litige.findAll({
            where: {
                [Op.or]: [
                    { demandeur_id: userId },
                    { defenseur_id: userId },
                ],
            },
            include: [{ model: Order, attributes: ['id', 'statut', 'total_ttc'] }],
            order: [['created_at', 'DESC']],
        });
    },

    findAllAdmin(statut) {
        return Litige.findAll({
            where: statut ? { statut } : {},
            include: [
                { model: User, as: 'demandeur', attributes: ['nom_complet', 'role'] },
                { model: User, as: 'defenseur', attributes: ['nom_complet', 'role'] },
                { model: Order, attributes: ['id', 'total_ttc', 'statut'] },
            ],
            order: [['created_at', 'DESC']],
        });
    },

    addEvent(data, { transaction } = {}) {
        return LitigeEvenement.create(data, { transaction });
    },

    findAdmins() {
        return User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
    },

    createNotification(data) {
        return Notification.create(data);
    },
};

module.exports = disputeRepository;
