const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

// Insights de vente (Fournisseurs uniquement)
router.get('/insights', authMiddleware, authorize(['fournisseur']), aiController.getSalesInsights);

// Analyse de confiance (Tout utilisateur connecté)
router.get('/trust-score', authMiddleware, aiController.getTrustAnalysis);

module.exports = router;
