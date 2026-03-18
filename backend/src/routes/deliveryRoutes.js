const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/available', protect, authorize('transporteur'), deliveryController.getAvailableOrders);
router.post('/assign', protect, authorize('transporteur'), deliveryController.assignOrder);
router.post('/tracking', protect, authorize('transporteur'), deliveryController.updateTracking);
router.post('/verify', protect, authorize('transporteur'), deliveryController.verifyDelivery);
router.get('/history/:orderId', protect, deliveryController.getTrackingHistory);

module.exports = router;
