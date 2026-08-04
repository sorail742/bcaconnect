const express = require('express');
const router = express.Router();
const couponController = require('../controller/coupon.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');

router.post('/', protect, authorize('admin', 'fournisseur'), couponController.create);
router.get('/mine', protect, authorize('admin', 'fournisseur'), couponController.getMine);
router.post('/validate', protect, couponController.validate);
router.put('/:id/toggle', protect, authorize('admin', 'fournisseur'), couponController.toggleActive);
router.get('/:id/stats', protect, authorize('admin', 'fournisseur'), couponController.getStats);

module.exports = router;
