const express = require('express');
const router = express.Router();
const productQuestionController = require('../controller/productQuestion.controller');
const { protect, optionalAuth } = require('../../middlewares/authMiddleware');

router.get('/vendor/pending', protect, productQuestionController.getPendingForVendor);
router.get('/product/:productId', optionalAuth, productQuestionController.getForProduct);
router.post('/product/:productId', protect, productQuestionController.ask);
router.put('/:id/answer', protect, productQuestionController.answer);
router.post('/:id/helpful', optionalAuth, productQuestionController.markHelpful);
router.delete('/:id', protect, productQuestionController.remove);

module.exports = router;
