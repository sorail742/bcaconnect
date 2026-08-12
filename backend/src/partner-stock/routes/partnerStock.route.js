const express = require('express');
const router = express.Router();
const partnerStockController = require('../controller/partnerStock.controller');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const {
    validateProduitIdParam,
    validateCreate,
    validateUpdate,
    validateIdParam,
} = require('../validator/partnerStock.validator');

router.get('/product/:produitId', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), validateProduitIdParam, partnerStockController.listByProduct);
router.get('/product/:produitId/total', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), validateProduitIdParam, partnerStockController.getTotalStock);
router.post('/product/:produitId', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), validateCreate, partnerStockController.create);
router.put('/:id', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), validateUpdate, partnerStockController.update);
router.delete('/:id', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), validateIdParam, partnerStockController.delete);

module.exports = router;
