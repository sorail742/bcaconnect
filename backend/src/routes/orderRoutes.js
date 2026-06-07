const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, authorize, grantAccess } = require('../middlewares/authMiddleware');
const { validateCreateOrder, validateUpdateOrder } = require('../middlewares/dtoValidator');

router.post('/', authMiddleware, grantAccess('place_orders'), validateCreateOrder, orderController.create);
router.get('/shipping-quote', authMiddleware, orderController.getShippingQuote);
router.get('/me', authMiddleware, orderController.getMyOrders);
router.get('/vendor', authMiddleware, authorize(['fournisseur', 'admin']), orderController.getVendorOrders);
router.get('/', authMiddleware, authorize(['admin']), orderController.getAllOrders);
// ⚠️ Route spécifique AVANT la route générique pour éviter le conflit Express
router.patch('/items/:itemId/status', authMiddleware, authorize(['fournisseur', 'admin']), orderController.updateItemStatus);
router.patch('/:orderId/status', authMiddleware, validateUpdateOrder, orderController.updateOrderStatus);
router.get('/:id', authMiddleware, orderController.getOrderById);

module.exports = router;
