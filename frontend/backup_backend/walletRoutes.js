const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/me', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);

module.exports = router;
