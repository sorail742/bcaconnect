const { Op } = require('sequelize');
const AppError = require('../../utils/AppError');
const auditLogRepository = require('../repository/auditLog.repository');

const auditLogService = {
    async getAll({ page = 1, limit = 30, search = '', niveau_alerte = '', utilisateur_id = '', adresse_ip = '', date_debut = '', date_fin = '', sort = 'recent' }) {
        const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 30);
        const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));

        const where = {};
        if (niveau_alerte) where.niveau_alerte = niveau_alerte;
        if (utilisateur_id) where.utilisateur_id = utilisateur_id;
        if (adresse_ip) where.adresse_ip = { [Op.iLike]: `%${adresse_ip}%` };
        if (search) {
            where[Op.or] = [
                { action: { [Op.iLike]: `%${search}%` } },
                { table_affectee: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }
        if (date_debut || date_fin) {
            where.createdAt = {};
            if (date_debut) where.createdAt[Op.gte] = new Date(date_debut);
            if (date_fin) where.createdAt[Op.lte] = new Date(`${date_fin}T23:59:59.999Z`);
        }

        const { count, rows } = await auditLogRepository.findAndCountAllFiltered({
            where,
            order: [['createdAt', sort === 'ancien' ? 'ASC' : 'DESC']],
            limit: lim,
            offset,
        });

        return {
            total: count,
            pages: Math.ceil(count / lim),
            currentPage: parseInt(page, 10) || 1,
            logs: rows,
        };
    },

    async getById(id) {
        const log = await auditLogRepository.findById(id);
        if (!log) throw new AppError('Entrée introuvable.', 404);
        return log;
    },

    // Vue de synthèse : sessions/IP distinctes par utilisateur sur les 30 derniers jours
    async getUserActivitySummary(userId) {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const logs = await auditLogRepository.findAllForUserSince(userId, since, 500);

        const ipSet = new Set();
        const actionCounts = {};
        for (const log of logs) {
            if (log.adresse_ip) ipSet.add(log.adresse_ip);
            actionCounts[log.table_affectee] = (actionCounts[log.table_affectee] || 0) + 1;
        }

        return {
            total_actions_30j: logs.length,
            adresses_ip_distinctes: Array.from(ipSet),
            repartition_par_ressource: actionCounts,
            derniere_action: logs[0] || null,
        };
    },
};

module.exports = auditLogService;
