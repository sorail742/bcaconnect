const express = require('express');
const router = express.Router();
const creditController = require('../controller/credit.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { validateCreditRequest } = require('../validator/credit.validator');

router.post('/simulate', creditController.simulateCredit);
router.post('/request', protect, validateCreditRequest, creditController.requestCredit);
router.get('/micro/config', creditController.getMicroCreditConfig);
router.post('/micro/request', protect, creditController.requestMicroCredit);
router.get('/pending', protect, authorize('admin', 'banque'), creditController.getPendingCredits);
router.get('/applicants-map', protect, authorize('admin', 'banque'), creditController.getCreditApplicantsMap);
router.get('/my', protect, creditController.getMyCredits);
router.get('/score', protect, creditController.getUserScore);
router.post('/pay/:id', protect, creditController.payInstallment);
router.put('/:id/approve', protect, authorize('admin', 'banque'), creditController.approveCredit);
router.put('/:id/reject', protect, authorize('admin', 'banque'), creditController.rejectCredit);

module.exports = router;
