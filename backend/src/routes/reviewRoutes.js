const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/featured', reviewController.getFeaturedReviews);
router.get('/eligible', authMiddleware, reviewController.getEligible);
router.post('/create', authMiddleware, reviewController.create);
router.get('/product/:productId', reviewController.getProductReviews);

module.exports = router;
