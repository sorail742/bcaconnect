const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, reviewController.create);
router.get('/product/:productId', reviewController.getProductReviews);

module.exports = router;
