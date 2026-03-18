const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, orderController.create);
router.get('/me', authMiddleware, orderController.getMyOrders);
router.get('/vendor', authMiddleware, authorize(['fournisseur', 'admin']), orderController.getVendorOrders);
router.get('/', authMiddleware, authorize(['admin']), orderController.getAllOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.patch('/:orderId/status', authMiddleware, orderController.updateOrderStatus);
router.patch('/items/:itemId/status', authMiddleware, authorize(['fournisseur', 'admin']), orderController.updateItemStatus);

module.exports = router;
