const catchAsync = require('../../utils/catchAsync');
const auditLogService = require('../service/auditLog.service');

const auditLogController = {
    getAll: catchAsync(async (req, res) => {
        const result = await auditLogService.getAll(req.query);
        res.json(result);
    }),

    getById: catchAsync(async (req, res) => {
        const log = await auditLogService.getById(req.params.id);
        res.json(log);
    }),

    // Vue de synthèse : sessions/IP distinctes par utilisateur sur les 30 derniers jours
    getUserActivitySummary: catchAsync(async (req, res) => {
        const result = await auditLogService.getUserActivitySummary(req.params.userId);
        res.json(result);
    }),
};

module.exports = auditLogController;
