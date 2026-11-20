const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const paymentProviderService = require('../../services/paymentProviderService');
const paymentService = require('../service/payment.service');

const paymentController = {
    initiateDeposit: catchAsync(async (req, res) => {
        const result = await paymentService.initiateDeposit(req.body, req.user);
        res.status(201).json(result);
    }),

    // Webhook de confirmation (public, appelé par le provider — x-www-form-urlencoded)
    handleWebhook: catchAsync(async (req, res, next) => {
        if (!paymentProviderService.verifyWebhookSignature(req)) {
            return next(new AppError('Signature webhook non autorisée.', 403));
        }
        const result = await paymentService.handleWebhook(req.body, req.query, req.app);
        res.json(result);
    }),

    getPaymentStatus: catchAsync(async (req, res) => {
        const result = await paymentService.getPaymentStatus(req.params.transactionId, req.user);
        res.json(result);
    }),

    captureSimulation: catchAsync(async (req, res) => {
        const result = await paymentService.captureSimulation(req.body, req.app);
        res.json(result);
    }),
};

module.exports = paymentController;
