const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateCreateDelivery, validateUpdateDelivery } = require('../middlewares/dtoValidator');

router.get('/available', protect, authorize('transporteur'), deliveryController.getAvailableOrders);
router.post('/assign', protect, authorize('transporteur'), validateCreateDelivery, deliveryController.assignOrder);
router.post('/tracking', protect, authorize('transporteur'), validateUpdateDelivery, deliveryController.updateTracking);
router.post('/verify', protect, authorize('transporteur'), deliveryController.verifyDelivery);
router.get('/mine', protect, authorize('transporteur'), deliveryController.getMyDeliveries);
router.get('/history/:orderId', protect, deliveryController.getTrackingHistory);

module.exports = router;
