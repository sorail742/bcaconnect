const catchAsync = require('../../utils/catchAsync');
const orderService = require('../service/order.service');

const orderController = {
    getShippingQuote: catchAsync(async (req, res) => {
        const result = orderService.getShippingQuote(req.query);
        res.json(result);
    }),

    create: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await orderService.create(req.body, req.user, io);
        res.status(result.outcome === 'already_processed' ? 200 : 201).json(result.order);
    }),

    getMyOrders: catchAsync(async (req, res) => {
        const result = await orderService.getMyOrders(req.user.id, req.query);
        res.json(result);
    }),

    // Carte des marchands du client connecté
    getMyVendorsMap: catchAsync(async (req, res) => {
        const result = await orderService.getMyVendorsMap(req.user.id);
        res.json(result);
    }),

    getOrderById: catchAsync(async (req, res) => {
        const order = await orderService.getOrderById(req.params.id, req.user);
        res.json(order);
    }),

    getVendorOrders: catchAsync(async (req, res) => {
        const result = await orderService.getVendorOrders(req.user.id, req.query);
        res.json(result);
    }),

    getVendorOrderLogistics: catchAsync(async (req, res) => {
        const result = await orderService.getVendorOrderLogistics(req.params.orderId, req.user);
        res.json(result);
    }),

    getAllOrders: catchAsync(async (req, res) => {
        const result = await orderService.getAllOrders(req.query);
        res.json(result);
    }),

    updateItemStatus: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await orderService.updateItemStatus(req.params.itemId, req.body, req.user, io, req.app);
        res.json(result);
    }),

    /** Préparer en une fois tous les articles du vendeur pour une commande */
    prepareVendorOrder: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await orderService.prepareVendorOrder(req.params.orderId, req.user, io, req.app);
        res.json(result);
    }),

    updateOrderStatus: catchAsync(async (req, res) => {
        const result = await orderService.updateOrderStatus(req.params.orderId, req.body, req.user);
        res.json(result);
    })
};

module.exports = orderController;
