const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/', storeController.getAll);
router.get('/me', authMiddleware, authorize(['fournisseur']), storeController.getMyStore);
router.post('/', authMiddleware, authorize(['fournisseur']), storeController.create);

module.exports = router;
