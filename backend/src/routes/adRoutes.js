const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');

// Routes d'affichage
router.get('/', adController.getAll);
router.get('/serve', optionalAuth, adController.getForUser);
router.post('/:id/click', adController.recordClick);

// Routes protégées
router.post('/', authMiddleware, adController.create);
router.get('/:id/stats', authMiddleware, adController.getStats);

module.exports = router;
