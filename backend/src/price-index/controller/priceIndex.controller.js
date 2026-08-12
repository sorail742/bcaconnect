const catchAsync = require('../../utils/catchAsync');
const priceIndexService = require('../service/priceIndex.service');

const priceIndexController = {
    getByCategory: catchAsync(async (req, res) => {
        const months = req.query.months ? parseInt(req.query.months, 10) : 6;
        const result = await priceIndexService.getByCategory(req.params.categorieId, { months });
        res.json(result);
    }),

    getByProduct: catchAsync(async (req, res) => {
        const months = req.query.months ? parseInt(req.query.months, 10) : 6;
        const result = await priceIndexService.getByProduct(req.params.produitId, { months });
        res.json(result);
    }),
};

module.exports = priceIndexController;
