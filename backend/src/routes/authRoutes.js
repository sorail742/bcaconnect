const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { 
    validateRegister, 
    validateLogin, 
    validateGoogleLogin,
    validateRefreshToken,
    validateVerify2FA,
    validateConfirm2FA,
    validateUpdateProfile
} = require('../middlewares/dtoValidator');

// Routes publiques avec validation DTO complète
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/google-login', validateGoogleLogin, authController.googleLogin);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/verify-2fa', validateVerify2FA, authController.verify2FA);

// Routes protégées avec validation DTO
router.get('/me', authMiddleware, authController.getMe);
router.put('/update', authMiddleware, validateUpdateProfile, authController.updateProfile);
router.delete('/delete', authMiddleware, authController.deleteAccount);

// 🛡️ Routes Sécurité 2FA avec validation DTO
router.get('/setup-2fa', authMiddleware, authController.setup2FA);
router.post('/confirm-2fa', authMiddleware, validateConfirm2FA, authController.confirm2FA);

module.exports = router;
