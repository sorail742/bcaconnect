const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { validateCreateProduct, validateUpdateProduct, validateDeleteProduct, validateSearch, validatePatchReappro } = require('../validator/product.validator');

// Route vendeur : MES produits (doit être avant /:id !)
router.get('/me/products', authMiddleware, productController.getMyProducts);

// Routes publiques
router.get('/', validateSearch, productController.getAll);
router.get('/:id', productController.getById);

// Routes protégées vendeur / admin
router.post('/', authMiddleware, checkPermission('PRODUCTS_CREATE'), validateCreateProduct, productController.create);
router.put('/:id', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), validateUpdateProduct, productController.update);
router.patch('/:id/stock', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), productController.patchStock);
router.patch('/:id/reappro', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), validatePatchReappro, productController.patchReappro);
router.delete('/:id', authMiddleware, checkPermission('PRODUCTS_DELETE_OWN'), validateDeleteProduct, productController.delete);

module.exports = router;
