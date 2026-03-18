const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, orderController.getMyOrders);
router.get('/vendor', authMiddleware, authorize(['fournisseur', 'admin']), orderController.getVendorOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.patch('/:orderId/status', authMiddleware, orderController.updateOrderStatus);
router.patch('/items/:itemId/status', authMiddleware, authorize(['fournisseur', 'admin']), orderController.updateItemStatus);
router.post('/', authMiddleware, authorize(['client']), orderController.create);

module.exports = router;
