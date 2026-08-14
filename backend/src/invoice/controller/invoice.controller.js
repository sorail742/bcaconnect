const catchAsync = require('../../utils/catchAsync');
const invoiceService = require('../service/invoice.service');

const invoiceController = {
    createFromOrder: catchAsync(async (req, res) => {
        const invoices = await invoiceService.getOrCreateForOrder(req.params.orderId, req.body, req.user);
        res.status(201).json(invoices);
    }),

    getById: catchAsync(async (req, res) => {
        const invoice = await invoiceService.getById(req.params.id, req.user);
        res.json(invoice);
    }),

    listMine: catchAsync(async (req, res) => {
        const invoices = await invoiceService.listMine(req.user.id);
        res.json(invoices);
    }),

    listVendorMine: catchAsync(async (req, res) => {
        const invoices = await invoiceService.listForVendor(req.user.id);
        res.json(invoices);
    }),
};

module.exports = invoiceController;
