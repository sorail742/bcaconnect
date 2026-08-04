const express = require('express');
const router = express.Router();
const groupPurchaseController = require('../controller/groupPurchase.controller');
const { authMiddleware, authorize } = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, groupPurchaseController.list);
router.get('/:id', authMiddleware, groupPurchaseController.getById);

router.post(
    '/',
    authMiddleware,
    authorize('client', 'admin', 'fournisseur', 'banque'),
    groupPurchaseController.create,
);

router.post('/:id/join', authMiddleware, authorize('client', 'admin', 'fournisseur', 'banque', 'technicien'), groupPurchaseController.join);
router.delete('/:id/leave', authMiddleware, groupPurchaseController.leave);
router.post('/:id/close', authMiddleware, groupPurchaseController.close);

module.exports = router;
