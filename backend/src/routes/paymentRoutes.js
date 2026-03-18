const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Initier un dépôt (nécessite auth)
router.post('/initiate', authMiddleware, paymentController.initiateDeposit);

// Webhook de confirmation (public, appelé par l'agrégateur)
router.post('/webhook', paymentController.handleWebhook);

// Simulation de succès (nécessite auth)
router.post('/capture-simulation', authMiddleware, paymentController.captureSimulation);

module.exports = router;
