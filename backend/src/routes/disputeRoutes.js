const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateCreateDispute, validateDisputeStatus, validateUpdateDispute } = require('../middlewares/dtoValidator');

router.post('/', protect, validateCreateDispute, disputeController.createDispute);
router.get('/my', protect, disputeController.getMyDisputes);
router.get('/admin', protect, authorize('admin'), disputeController.getAllDisputes);
router.get('/:id', protect, disputeController.getDisputeById);
router.put('/:id/status', protect, authorize('admin'), validateDisputeStatus, disputeController.updateDisputeStatus);
router.put('/:id/resolve', protect, authorize('admin'), validateUpdateDispute, disputeController.resolveDispute);

module.exports = router;
