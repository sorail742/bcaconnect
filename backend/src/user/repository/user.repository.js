const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../models/user.model');

const userRepository = {
    listUsers({ page = 1, limit = 10, search = '', role = '' } = {}) {
        const offset = (page - 1) * limit;
        const where = { statut: { [Op.ne]: 'supprime' } };
        const likeOp = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;

        if (search) {
            where[Op.or] = [
                { nom_complet: { [likeOp]: `%${search}%` } },
                { email: { [likeOp]: `%${search}%` } },
            ];
        }
        if (role) where.role = role;

        return User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            attributes: { exclude: ['mot_de_passe'] },
            order: [['createdAt', 'DESC']],
        });
    },

    countActiveCreatedSince(date) {
        return User.count({ where: { createdAt: { [Op.gte]: date }, statut: { [Op.ne]: 'supprime' } } });
    },

    countActiveCreatedBetween(start, end) {
        return User.count({ where: { createdAt: { [Op.between]: [start, end] }, statut: { [Op.ne]: 'supprime' } } });
    },

    findAllForLocations({ role } = {}) {
        const where = { statut: { [Op.ne]: 'supprime' } };
        if (role) where.role = role;

        return User.findAll({
            where,
            attributes: [
                'id', 'nom_complet', 'role', 'adresse', 'location', 'avatar_url',
                'categorie_activite', 'specialites', 'metadata_transporteur', 'score_confiance',
            ],
        });
    },

    findPublicUsers({ search = '', excludeUserId, limit = 20 } = {}) {
        const where = {
            statut: { [Op.notIn]: ['bloque', 'supprime', 'suspendu'] },
            id: { [Op.ne]: excludeUserId },
        };

        const term = String(search || '').trim();
        if (term) {
            const likeOp = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
            where[Op.or] = [
                { nom_complet: { [likeOp]: `%${term}%` } },
                { email: { [likeOp]: `%${term}%` } },
                { role: { [likeOp]: `%${term}%` } },
            ];
        }

        return User.findAll({
            where,
            limit,
            attributes: ['id', 'nom_complet', 'role', 'statut', 'email'],
            order: [['nom_complet', 'ASC']],
        });
    },

    findByEmail(email, { transaction } = {}) {
        return User.findOne({ where: { email }, transaction });
    },

    findById(id, { transaction } = {}) {
        return User.findByPk(id, { transaction });
    },

    findByIdWithAttributes(id, attributes) {
        return User.findByPk(id, { attributes });
    },

    create(data, { transaction } = {}) {
        return User.create(data, { transaction });
    },

    updateInstance(user, data, { transaction } = {}) {
        return user.update(data, { transaction });
    },
};

module.exports = userRepository;
