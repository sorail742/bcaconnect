const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, authorize, grantAccess } = require('../middlewares/authMiddleware');

router.get('/', categoryController.getAll);

// Admin only routes
router.post('/', authMiddleware, grantAccess('manage_categories'), categoryController.create);
router.put('/:id', authMiddleware, grantAccess('manage_categories'), categoryController.update);
router.delete('/:id', authMiddleware, grantAccess('manage_categories'), categoryController.delete);

module.exports = router;
