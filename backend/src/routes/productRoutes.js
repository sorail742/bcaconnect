const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authMiddleware, authorize(['fournisseur']), productController.create);

module.exports = router;
