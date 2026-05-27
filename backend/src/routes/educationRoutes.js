const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const { authMiddleware } = require('../middlewares/auth');

// Note: on utilise authMiddleware optionnellement, ou public
router.get('/', educationController.getAllResources);

module.exports = router;
