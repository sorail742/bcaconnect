const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const { checkPermission } = require('../middlewares/rbacMiddleware');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authMiddleware, checkPermission('PRODUCTS_CREATE'), productController.create);
router.put('/:id', authMiddleware, checkPermission('PRODUCTS_EDIT_OWN'), productController.update);
router.delete('/:id', authMiddleware, checkPermission('PRODUCTS_DELETE_OWN'), productController.delete);

module.exports = router;
