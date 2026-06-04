const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const { optionalAuth } = require('../middlewares/authMiddleware');

// Note: on utilise authMiddleware optionnellement, ou public
router.get('/', optionalAuth, educationController.getAllResources);

module.exports = router;
