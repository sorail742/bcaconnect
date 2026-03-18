const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/admin', protect, authorize('admin'), dashboardController.getAdminStats);
router.get('/financial', protect, authorize('admin', 'banque'), dashboardController.getFinancialReports);

module.exports = router;
