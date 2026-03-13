const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/', categoryController.getAll);
router.post('/', authMiddleware, authorize(['admin']), categoryController.create);

module.exports = router;
