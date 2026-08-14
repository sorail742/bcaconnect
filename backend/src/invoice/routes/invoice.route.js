const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/invoice.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { validateCreateFromOrder, validateIdParam } = require('../validator/invoice.validator');

router.get('/mine', protect, invoiceController.listMine);
router.get('/vendor-mine', protect, invoiceController.listVendorMine);
router.get('/export/syscohada', protect, invoiceController.exportSyscohada);
router.post('/from-order/:orderId', protect, validateCreateFromOrder, invoiceController.createFromOrder);
router.get('/:id', protect, validateIdParam, invoiceController.getById);

module.exports = router;
