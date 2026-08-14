const catchAsync = require('../../utils/catchAsync');
const partnerStockService = require('../service/partnerStock.service');

const partnerStockController = {
    listByProduct: catchAsync(async (req, res) => {
        const entries = await partnerStockService.listByProduct(req.params.produitId, req.user);
        res.json(entries);
    }),

    getTotalStock: catchAsync(async (req, res) => {
        const result = await partnerStockService.getTotalStock(req.params.produitId, req.user);
        res.json(result);
    }),

    create: catchAsync(async (req, res) => {
        const entry = await partnerStockService.create(req.params.produitId, req.body, req.user);
        res.status(201).json(entry);
    }),

    update: catchAsync(async (req, res) => {
        const entry = await partnerStockService.update(req.params.id, req.body, req.user);
        res.json(entry);
    }),

    delete: catchAsync(async (req, res) => {
        const result = await partnerStockService.delete(req.params.id, req.user);
        res.json(result);
    }),
};

module.exports = partnerStockController;
