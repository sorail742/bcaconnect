const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, walletController.getMyWallet);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.get('/all', authMiddleware, authorize(['admin', 'banque']), walletController.getAllTransactions);

// 🛑 SÉCURITÉ FINTECH : Plancher à Billet bloquée. Accès restreint uniquement aux Admins/Banques pour recharge manuelle.
router.post('/recharge', authMiddleware, authorize(['admin', 'banque']), walletController.recharge);

// 🛡️ SÉCURITÉ FINTECH : Route asynchrone sécurisée par signature HMAC (Orange Money / Stripe / PayCard)
router.post('/webhook/recharge', walletController.rechargeWebhook);

router.post('/transfer', authMiddleware, walletController.transfer);

module.exports = router;
