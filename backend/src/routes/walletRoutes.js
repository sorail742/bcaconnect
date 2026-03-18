const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, walletController.getMyWallet);
router.get('/transactions', authMiddleware, walletController.getTransactions);

module.exports = router;
