const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, orderController.getMyOrders);
router.post('/', authMiddleware, authorize(['client']), orderController.create);

module.exports = router;
