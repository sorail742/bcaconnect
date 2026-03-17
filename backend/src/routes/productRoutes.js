const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbacMiddleware');

// Routes publiques
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Routes protégées vendeur / admin
router.get('/me/products', authMiddleware, productController.getMyProducts);
router.post('/', authMiddleware, checkPermission('PRODUCTS_CREATE'), productController.create);
router.put('/:id', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), productController.update);
router.patch('/:id/stock', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), productController.patchStock);
router.delete('/:id', authMiddleware, checkPermission('PRODUCTS_DELETE_OWN'), productController.delete);

module.exports = router;
