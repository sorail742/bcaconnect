const catchAsync = require('../../utils/catchAsync');
const alertThresholdService = require('../service/alertThreshold.service');

const alertThresholdController = {
    listMine: catchAsync(async (req, res) => {
        const seuils = await alertThresholdService.listMine(req.user.id);
        res.json(seuils);
    }),

    createOrUpdate: catchAsync(async (req, res) => {
        const seuil = await alertThresholdService.createOrUpdate(req.user.id, req.body);
        res.status(201).json(seuil);
    }),

    toggle: catchAsync(async (req, res) => {
        const seuil = await alertThresholdService.toggle(req.params.id, req.user.id, req.body.actif);
        res.json(seuil);
    }),

    remove: catchAsync(async (req, res) => {
        const result = await alertThresholdService.remove(req.params.id, req.user.id);
        res.json(result);
    }),
};

module.exports = alertThresholdController;
