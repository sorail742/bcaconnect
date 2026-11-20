const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const dashboardController = require('../controller/dashboard.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');

const publicStatsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { message: 'Trop de requêtes sur les statistiques publiques.' },
});

router.get('/admin', protect, authorize('admin'), dashboardController.getAdminStats);
router.get('/admin/public', publicStatsLimiter, dashboardController.getPublicLandingStats);
router.get('/financial', protect, authorize('admin', 'banque'), dashboardController.getFinancialReports);
router.get('/vendor', protect, authorize('fournisseur', 'admin'), dashboardController.getVendorStats);
router.get('/trends', publicStatsLimiter, dashboardController.getTrends);
router.get('/ai-logs', protect, authorize('admin'), dashboardController.getAiLogs);

module.exports = router;
