const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const Review = require('../models/review.model');
// NOTE: Order/OrderItem appartiennent à la feature `order` (déjà migrée) mais
// ces requêtes sont trop spécifiques à l'éligibilité des avis pour vivre dans
// order.repository.js — même logique que ailleurs (ex: delivery.repository.js).
const Order = require('../../order/models/order.model');
const OrderItem = require('../../order/models/orderItem.model');
const { User } = require('../../models');

const reviewRepository = {
    findOrderForUserWithDetails(orderId, userId, transaction) {
        return Order.findOne({
            where: { id: orderId, utilisateur_id: userId },
            include: [{ model: OrderItem, as: 'details' }],
            transaction,
        });
    },

    findExisting(userId, produitId, commandeId, transaction) {
        return Review.findOne({
            where: { utilisateur_id: userId, produit_id: produitId, commande_id: commandeId },
            transaction,
        });
    },

    create(data, { transaction } = {}) {
        return Review.create(data, { transaction });
    },

    findUserById(userId, transaction) {
        return User.findByPk(userId, { transaction });
    },

    updateUserScore(user, newScore, transaction) {
        return user.update({ score_confiance: newScore }, { transaction });
    },

    findAllByUserAndProduct(userId, produitId) {
        return Review.findAll({
            where: { utilisateur_id: userId, produit_id: produitId },
            attributes: ['commande_id'],
        });
    },

    findDeliveredOrdersForProduct(userId, produitId, excludeIds) {
        return Order.findAll({
            where: {
                utilisateur_id: userId,
                statut: 'livré',
                ...(excludeIds.length ? { id: { [Op.notIn]: excludeIds } } : {}),
            },
            include: [{
                model: OrderItem,
                as: 'details',
                where: { produit_id: produitId },
                required: true,
            }],
            order: [['createdAt', 'DESC']],
        });
    },

    findAnyOrdersWithProduct(userId, produitId) {
        return Order.findAll({
            where: { utilisateur_id: userId },
            attributes: ['id', 'statut'],
            include: [{ model: OrderItem, as: 'details', where: { produit_id: produitId }, required: true, attributes: [] }],
        });
    },

    findApprovedForProduct(productId) {
        return Review.findAll({
            where: { produit_id: productId, est_approuve: true },
            include: [{ model: User, attributes: ['nom_complet'] }],
            order: [['createdAt', 'DESC']],
        });
    },

    getAverageApprovedRating() {
        return Review.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('note')), 'avgNote']],
            where: { est_approuve: true },
            raw: true,
        });
    },

    countApproved() {
        return Review.count({ where: { est_approuve: true } });
    },

    findFeatured(limit = 12) {
        return Review.findAll({
            where: {
                est_approuve: true,
                commentaire: { [Op.and]: [{ [Op.ne]: '' }, { [Op.ne]: null }] },
            },
            include: [{
                model: User,
                attributes: ['id', 'nom_complet', 'role', 'specialites'],
            }],
            order: [['note', 'DESC'], ['created_at', 'DESC']],
            limit,
        });
    },

    countUserOrdersByStatuses(userId, statuses) {
        return Order.count({
            where: { utilisateur_id: userId, statut: { [Op.in]: statuses } },
        });
    },
};

module.exports = reviewRepository;
