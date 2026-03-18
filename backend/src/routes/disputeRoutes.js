const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, disputeController.createDispute);
router.get('/my', protect, disputeController.getMyDisputes);
router.get('/admin', protect, authorize('admin'), disputeController.getAllDisputes);
router.put('/:id/resolve', protect, authorize('admin'), disputeController.resolveDispute);

module.exports = router;
