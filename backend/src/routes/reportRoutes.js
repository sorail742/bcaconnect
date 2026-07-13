const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/vendor-performance', protect, authorize('fournisseur'), reportController.getVendorPerformance);
router.get('/expenses', protect, reportController.getExpenseReport);
router.get('/delivery-kpi', protect, authorize('admin'), reportController.getDeliveryKPI);

module.exports = router;
