const express = require('express');
const router = express.Router();
const rfqController = require('../controller/rfq.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');

router.post('/', protect, authorize('client', 'fournisseur'), rfqController.create);
router.get('/open', protect, authorize('fournisseur', 'admin'), rfqController.getOpen);
router.get('/mine', protect, rfqController.getMine);
router.get('/my-quotes', protect, authorize('fournisseur'), rfqController.getMyQuotes);
router.get('/:id', protect, rfqController.getById);
router.post('/:id/quotes', protect, authorize('fournisseur'), rfqController.submitQuote);
router.put('/:id/quotes/:quoteId/accept', protect, rfqController.acceptQuote);
router.put('/:id/close', protect, rfqController.close);

module.exports = router;
