const express = require('express');
const router = express.Router();
const disputeController = require('../controller/dispute.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const {
    validateCreateDispute,
    validateDisputeStatus,
    validateDisputeRespond,
    validateDisputeEscalate,
    validateUpdateDispute,
    validateDisputeArchive,
} = require('../validator/dispute.validator');

router.post('/', protect, validateCreateDispute, disputeController.createDispute);
router.get('/my', protect, disputeController.getMyDisputes);
router.get('/admin', protect, authorize('admin'), disputeController.getAllDisputes);
router.get('/:id', protect, disputeController.getDisputeById);
router.post('/:id/respond', protect, validateDisputeRespond, disputeController.respondToDispute);
router.post('/:id/accept-proposal', protect, disputeController.acceptProposal);
router.post('/:id/escalate', protect, validateDisputeEscalate, disputeController.escalateDispute);
router.put('/:id/status', protect, authorize('admin'), validateDisputeStatus, disputeController.updateDisputeStatus);
router.put('/:id/resolve', protect, authorize('admin'), validateUpdateDispute, disputeController.resolveDispute);
router.put('/:id/archive', protect, authorize('admin'), validateDisputeArchive, disputeController.archiveDispute);

module.exports = router;
