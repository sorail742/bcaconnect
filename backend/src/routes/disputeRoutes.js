const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateCreateDispute, validateUpdateDispute } = require('../middlewares/dtoValidator');

router.post('/', protect, validateCreateDispute, disputeController.createDispute);
router.get('/my', protect, disputeController.getMyDisputes);
router.get('/admin', protect, authorize('admin'), disputeController.getAllDisputes);
router.put('/:id/resolve', protect, authorize('admin'), validateUpdateDispute, disputeController.resolveDispute);

module.exports = router;
