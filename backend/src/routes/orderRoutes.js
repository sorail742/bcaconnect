const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const { validateCreateOrder, validateUpdateOrder } = require('../middlewares/dtoValidator');

router.post('/', authMiddleware, validateCreateOrder, orderController.create);
router.get('/me', authMiddleware, orderController.getMyOrders);
router.get('/vendor', authMiddleware, authorize(['fournisseur', 'admin']), orderController.getVendorOrders);
router.get('/', authMiddleware, authorize(['admin']), orderController.getAllOrders);
// ⚠️ Route spécifique AVANT la route générique pour éviter le conflit Express
router.patch('/items/:itemId/status', authMiddleware, authorize(['fournisseur', 'admin']), orderController.updateItemStatus);
router.patch('/:orderId/status', authMiddleware, validateUpdateOrder, orderController.updateOrderStatus);
router.get('/:id', authMiddleware, orderController.getOrderById);

module.exports = router;
