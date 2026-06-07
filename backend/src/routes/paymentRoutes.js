const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateCreatePayment } = require('../middlewares/dtoValidator');

// Initier un dépôt (nécessite auth + validation DTO)
router.post('/initiate', authMiddleware, validateCreatePayment, paymentController.initiateDeposit);

// Statut transaction (polling après retour CinetPay)
router.get('/status/:transactionId', authMiddleware, paymentController.getPaymentStatus);

// Webhook de confirmation (public, appelé par CinetPay — x-www-form-urlencoded)
router.post('/webhook', paymentController.handleWebhook);

// Simulation de succès (nécessite auth)
router.post('/capture-simulation', authMiddleware, paymentController.captureSimulation);

module.exports = router;
