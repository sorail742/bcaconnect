const catchAsync = require('../../utils/catchAsync');
const reviewService = require('../service/review.service');

const reviewController = {
    create: async (req, res, next) => {
        try {
            const result = await reviewService.create(req.body, req.user.id);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.status(201).json(result.review);
        } catch (error) {
            next(error);
        }
    },

    getEligible: catchAsync(async (req, res) => {
        const result = await reviewService.getEligible(req.query.produit_id, req.user.id);
        res.json(result);
    }),

    getProductReviews: async (req, res, next) => {
        try {
            const reviews = await reviewService.getProductReviews(req.params.productId);
            res.json(reviews);
        } catch (error) {
            next(error);
        }
    },

    /** Avis publics pour la landing (100 % dynamique) */
    getFeaturedReviews: catchAsync(async (req, res) => {
        const result = await reviewService.getFeaturedReviews();
        res.json(result);
    }),
};

module.exports = reviewController;
