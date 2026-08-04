const express = require('express');
const router = express.Router();
const certificationController = require('../controller/certification.controller');
const { authMiddleware, authorize, optionalAuth } = require('../../middlewares/authMiddleware');

// Statut public (badge boutique/produit)
router.get('/vendor/:vendorId/status', optionalAuth, certificationController.getVendorStatus);

router.use(authMiddleware);

// Fournisseur
router.post('/', authorize(['fournisseur']), certificationController.create);
router.get('/mine', authorize(['fournisseur']), certificationController.getMine);

// Admin
router.get('/', authorize(['admin']), certificationController.getAll);
router.put('/:id/review', authorize(['admin']), certificationController.review);

module.exports = router;
