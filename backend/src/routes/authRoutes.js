const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/inputValidator');

// Routes publiques
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify-2fa', authController.verify2FA);

// Routes protégées
router.get('/me', authMiddleware, authController.getMe);
router.put('/update', authMiddleware, authController.updateProfile);
router.delete('/delete', authMiddleware, authController.deleteAccount);

// 🛡️ Routes Sécurité 2FA
router.get('/setup-2fa', authMiddleware, authController.setup2FA);
router.post('/confirm-2fa', authMiddleware, authController.confirm2FA);

module.exports = router;
