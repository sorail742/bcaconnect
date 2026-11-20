const catchAsync = require('../../utils/catchAsync');
const groupPurchaseService = require('../service/groupPurchase.service');

const groupPurchaseController = {
    list: catchAsync(async (req, res) => {
        const result = await groupPurchaseService.list(req.query, req.user.id);
        res.json(result);
    }),

    getById: catchAsync(async (req, res) => {
        const campaign = await groupPurchaseService.getById(req.params.id);
        res.json(campaign);
    }),

    create: catchAsync(async (req, res) => {
        const full = await groupPurchaseService.create(req.body, req.user.id);
        res.status(201).json({ message: 'Campagne d\'achat groupé créée.', campaign: full });
    }),

    join: catchAsync(async (req, res) => {
        const result = await groupPurchaseService.join(req.params.id, req.body.quantite, req.user);
        res.status(201).json(result);
    }),

    leave: catchAsync(async (req, res) => {
        const result = await groupPurchaseService.leave(req.params.id, req.user);
        res.json(result);
    }),

    close: catchAsync(async (req, res) => {
        const result = await groupPurchaseService.close(req.params.id, req.user);
        res.json(result);
    }),
};

module.exports = groupPurchaseController;
