const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/', storeController.getAll);
router.get('/me', authMiddleware, authorize(['fournisseur']), storeController.getMyStore);
router.put('/me', authMiddleware, authorize(['fournisseur']), storeController.updateMyStore);
router.post('/', authMiddleware, authorize(['fournisseur']), storeController.create);
router.get('/:id', storeController.getById);

module.exports = router;
