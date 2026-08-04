const catchAsync = require('../../utils/catchAsync');
const productService = require('../service/product.service');

const productController = {
    create: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const fullProduct = await productService.create(req.body, req.user, io);
        res.status(201).json(fullProduct);
    }),

    getAll: catchAsync(async (req, res) => {
        const result = await productService.getAll(req.query, req.pagination);
        res.json(result);
    }),

    // Produits du vendeur connecté
    getMyProducts: catchAsync(async (req, res) => {
        const products = await productService.getMyProducts(req.user.id);
        res.json(products);
    }),

    getById: catchAsync(async (req, res) => {
        const plain = await productService.getById(req.params.id);
        res.json(plain);
    }),

    update: catchAsync(async (req, res) => {
        const result = await productService.update(req.params.id, req.body, req.user);
        res.json(result);
    }),

    // Mise à jour rapide du stock uniquement
    patchStock: catchAsync(async (req, res) => {
        const result = await productService.patchStock(req.params.id, req.body.stock_quantite, req.user);
        res.json(result);
    }),

    delete: catchAsync(async (req, res) => {
        const result = await productService.delete(req.params.id, req.user, req);
        res.json(result);
    })
};

module.exports = productController;
