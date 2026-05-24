const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateAssignOrder, validateCarrierTracking, validateVerifyOTP } = require('../middlewares/dtoValidator');

// ─── Route PUBLIQUE (pas de middleware protect) ────────────────────────────
router.get('/track/:trackingNumber', deliveryController.trackOrderPublic);

// ─── Routes PROTÉGÉES ──────────────────────────────────────────────────────
router.get('/available', protect, authorize('transporteur'), deliveryController.getAvailableOrders);
router.post('/assign', protect, authorize('transporteur'), validateAssignOrder, deliveryController.assignOrder);
router.post('/tracking', protect, authorize('transporteur'), validateCarrierTracking, deliveryController.updateTracking);
router.post('/verify', protect, authorize('transporteur'), validateVerifyOTP, deliveryController.verifyDelivery);
router.get('/mine', protect, authorize('transporteur'), deliveryController.getMyDeliveries);
router.get('/history/:orderId', protect, deliveryController.getTrackingHistory);

module.exports = router;
