const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateCreditRequest } = require('../middlewares/inputValidator');

router.post('/simulate', creditController.simulateCredit);
router.post('/request', protect, validateCreditRequest, creditController.requestCredit);
router.get('/my', protect, creditController.getMyCredits);
router.post('/pay/:id', protect, creditController.payInstallment);
router.put('/:id/approve', protect, authorize('admin'), creditController.approveCredit);

module.exports = router;
