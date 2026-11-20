const express = require('express');
const router = express.Router();
const storeController = require('../controller/store.controller');
const { authMiddleware, authorize } = require('../../middlewares/authMiddleware');

router.get('/', storeController.getAll);
router.get('/me', authMiddleware, authorize(['fournisseur', 'admin']), storeController.getMyStore);
router.get('/me/clients-map', authMiddleware, authorize(['fournisseur', 'admin']), storeController.getMyClientsMap);
router.put('/me', authMiddleware, authorize(['fournisseur', 'admin']), storeController.updateMyStore);
router.post('/me/subscribe', authMiddleware, authorize(['fournisseur', 'admin']), storeController.subscribe);
router.post('/', authMiddleware, authorize(['fournisseur', 'admin']), storeController.create);
router.get('/slug/:slug', storeController.getBySlug);
router.get('/:id', storeController.getById);

module.exports = router;
