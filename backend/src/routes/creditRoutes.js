const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateCreditRequest } = require('../middlewares/dtoValidator');

router.post('/simulate', creditController.simulateCredit);
router.post('/request', protect, validateCreditRequest, creditController.requestCredit);
router.get('/pending', protect, authorize('admin', 'banque'), creditController.getPendingCredits);
router.get('/my', protect, creditController.getMyCredits);
router.get('/score', protect, creditController.getUserScore);
router.post('/pay/:id', protect, creditController.payInstallment);
router.put('/:id/approve', protect, authorize('admin', 'banque'), creditController.approveCredit);
router.put('/:id/reject', protect, authorize('admin', 'banque'), creditController.rejectCredit);

module.exports = router;
