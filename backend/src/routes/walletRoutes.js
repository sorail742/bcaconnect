const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, walletController.getMyWallet);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.get('/all', authMiddleware, authorize(['admin', 'banque']), walletController.getAllTransactions);
router.post('/recharge', authMiddleware, walletController.recharge);
router.post('/transfer', authMiddleware, walletController.transfer);

module.exports = router;
