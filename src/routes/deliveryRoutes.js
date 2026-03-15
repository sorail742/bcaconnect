const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

// Toutes ces routes nécessitent le rôle 'transporteur'
router.use(authMiddleware, authorize(['transporteur']));

// Voir les commandes disponibles
router.get('/available', deliveryController.getAvailableOrders);

// Accepter une livraison
router.post('/assign', deliveryController.assignOrder);

// Mettre à jour le statut (ramassé, en cours, livré)
router.patch('/status', deliveryController.updateStatus);

module.exports = router;
