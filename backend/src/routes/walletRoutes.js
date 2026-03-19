const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, walletController.getMyWallet);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.get('/all', authMiddleware, authorize('admin'), walletController.getAllTransactions);

module.exports = router;
