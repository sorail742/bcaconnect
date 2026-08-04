const express = require('express');
const router = express.Router();
const productVariantController = require('../controller/productVariant.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/product/:productId', productVariantController.getForProduct);
router.post('/product/:productId', protect, productVariantController.create);
router.put('/:id', protect, productVariantController.update);
router.delete('/:id', protect, productVariantController.remove);

module.exports = router;
