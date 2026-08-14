const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const { authMiddleware, optionalAuth } = require('../../middlewares/authMiddleware');
const {
    validateRegister,
    validateLogin,
    validateGoogleLogin,
    validateRefreshToken,
    validateVerify2FA,
    validateConfirm2FA,
    validateUpdateProfile
} = require('../validator/auth.validator');

// Routes publiques avec validation DTO complète
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/google-login', validateGoogleLogin, authController.googleLogin);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);
router.post('/logout', optionalAuth, authController.logout);
router.post('/otp/request', authController.requestOtp);
router.post('/otp/verify', authController.verifyOtp);
router.post('/verify-2fa', validateVerify2FA, authController.verify2FA);

// Routes protégées avec validation DTO
router.get('/me', authMiddleware, authController.getMe);
router.put('/update', authMiddleware, validateUpdateProfile, authController.updateProfile);
router.delete('/delete', authMiddleware, authController.deleteAccount);

// 🛡️ Routes Sécurité 2FA avec validation DTO
router.get('/setup-2fa', authMiddleware, authController.setup2FA);
router.post('/confirm-2fa', authMiddleware, validateConfirm2FA, authController.confirm2FA);
router.post('/disable-2fa', authMiddleware, authController.disable2FA);

// 📴 Mode résilience hors ligne — PIN d'authentification locale
router.post('/offline-pin/set', authMiddleware, authController.setOfflinePin);
router.post('/offline-pin/verify', authMiddleware, authController.verifyOfflinePin);
router.get('/offline-credentials', authMiddleware, authController.getOfflineCredentials);

module.exports = router;
