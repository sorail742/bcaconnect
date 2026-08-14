const express = require('express');
const router = express.Router();
const deliveryController = require('../controller/delivery.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { validateAssignOrder, validateCarrierTracking, validateVerifyOTP } = require('../validator/delivery.validator');

// ─── Route PUBLIQUE (pas de middleware protect) ────────────────────────────
router.get('/track/:trackingNumber', deliveryController.trackOrderPublic);

// ─── Routes PROTÉGÉES ──────────────────────────────────────────────────────
router.get('/available', protect, authorize('transporteur'), deliveryController.getAvailableOrders);
router.post('/assign', protect, authorize('transporteur'), validateAssignOrder, deliveryController.assignOrder);
router.post('/tracking', protect, authorize('transporteur'), validateCarrierTracking, deliveryController.updateTracking);
router.post('/verify', protect, authorize('transporteur'), validateVerifyOTP, deliveryController.verifyDelivery);
router.post('/group', protect, authorize('transporteur'), deliveryController.groupOrders);
router.get('/groups/my', protect, authorize('transporteur'), deliveryController.getMyGroups);
router.get('/groups/:group_id/optimize', protect, authorize('transporteur'), deliveryController.optimizeRoute);
router.get('/mine', protect, authorize('transporteur'), deliveryController.getMyDeliveries);
router.get('/optimize-route', protect, authorize('transporteur'), deliveryController.optimizeMyRoute);
router.get('/completed', protect, authorize('transporteur'), deliveryController.getCompletedDeliveries);
router.get('/stats', protect, authorize('transporteur'), deliveryController.getCarrierStats);
router.get('/admin/overview', protect, authorize('admin'), deliveryController.getAdminLogisticsOverview);
router.get('/history/:orderId', protect, deliveryController.getTrackingHistory);

module.exports = router;
