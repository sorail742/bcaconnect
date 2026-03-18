const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateRegister } = require('../middlewares/inputValidator');

// Routes publiques
router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.put('/update', authMiddleware, authController.updateProfile);
router.delete('/delete', authMiddleware, authController.deleteAccount);

module.exports = router;
