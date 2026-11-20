const catchAsync = require('../../utils/catchAsync');
const deletionLogService = require('../service/deletionLog.service');

const deletionLogController = {
    getAll: catchAsync(async (req, res) => {
        const result = await deletionLogService.getAll(req.query);
        res.json(result);
    }),

    getById: catchAsync(async (req, res) => {
        const log = await deletionLogService.getById(req.params.id);
        res.json(log);
    }),

    restore: catchAsync(async (req, res) => {
        const restored = await deletionLogService.restore(req.params.id, req.user.id);
        res.json({ message: 'Élément restauré avec succès.', record: restored });
    }),
};

module.exports = deletionLogController;
