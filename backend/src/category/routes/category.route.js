const express = require('express');
const router = express.Router();
const categoryController = require('../controller/category.controller');
const { authMiddleware, grantAccess } = require('../../middlewares/authMiddleware');
const { validateCreateCategory } = require('../validator/category.validator');

router.get('/', categoryController.getAll);

// Admin only routes
router.post('/', authMiddleware, grantAccess('manage_categories'), validateCreateCategory, categoryController.create);
router.put('/:id', authMiddleware, grantAccess('manage_categories'), validateCreateCategory, categoryController.update);
router.delete('/:id', authMiddleware, grantAccess('manage_categories'), categoryController.delete);

module.exports = router;
