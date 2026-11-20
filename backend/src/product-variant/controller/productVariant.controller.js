const catchAsync = require('../../utils/catchAsync');
const productVariantService = require('../service/productVariant.service');

const productVariantController = {
    getForProduct: catchAsync(async (req, res) => {
        const variants = await productVariantService.getForProduct(req.params.productId);
        res.json(variants);
    }),

    create: catchAsync(async (req, res) => {
        const variant = await productVariantService.create(req.params.productId, req.body, req.user);
        res.status(201).json({ message: 'Variante créée.', variant });
    }),

    update: catchAsync(async (req, res) => {
        const variant = await productVariantService.update(req.params.id, req.body, req.user);
        res.json({ message: 'Variante mise à jour.', variant });
    }),

    remove: catchAsync(async (req, res) => {
        await productVariantService.remove(req.params.id, req.user);
        res.json({ message: 'Variante supprimée.' });
    }),
};

module.exports = productVariantController;
