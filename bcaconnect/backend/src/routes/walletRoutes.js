const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const { validateWalletTransfer, validateWalletDeposit } = require('../middlewares/dtoValidator');

router.get('/me', authMiddleware, walletController.getMyWallet);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.get('/all', authMiddleware, authorize(['admin', 'banque']), walletController.getAllTransactions);

// 🛑 SÉCURITÉ FINTECH : Accès restreint uniquement aux Admins/Banques pour recharge manuelle.
router.post('/recharge', authMiddleware, authorize(['admin', 'banque']), validateWalletDeposit, walletController.recharge);

// 🛡️ SÉCURITÉ FINTECH : Route asynchrone sécurisée par signature HMAC
router.post('/webhook/recharge', walletController.rechargeWebhook);

router.post('/transfer', authMiddleware, validateWalletTransfer, walletController.transfer);

module.exports = router;
