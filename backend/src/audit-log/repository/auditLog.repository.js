const { Op } = require('sequelize');
const AuditLog = require('../models/auditLog.model');
const { User } = require('../../models');

const AUTEUR_ATTRS = ['id', 'nom_complet', 'email', 'role'];

const auditLogRepository = {
    findAndCountAllFiltered({ where, order, limit, offset }) {
        return AuditLog.findAndCountAll({
            where,
            include: [{ model: User, attributes: AUTEUR_ATTRS }],
            order,
            limit,
            offset,
        });
    },

    findById(id) {
        return AuditLog.findByPk(id, {
            include: [{ model: User, attributes: AUTEUR_ATTRS }],
        });
    },

    findAllForUserSince(userId, since, limit = 500) {
        return AuditLog.findAll({
            where: { utilisateur_id: userId, createdAt: { [Op.gte]: since } },
            order: [['createdAt', 'DESC']],
            limit,
        });
    },
};

module.exports = auditLogRepository;
