const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

// ── Routes IA — BCA Connect Intelligence ─────────────────────────────────────

// 1. Insights de vente (Fournisseurs uniquement)
router.get('/insights', authMiddleware, authorize(['fournisseur']), aiController.getSalesInsights);

// 2. Analyse de confiance (Tout utilisateur connecté)
router.get('/trust-score', authMiddleware, aiController.getTrustAnalysis);

// 3. Tendances du marché guinéen (Toute personne connectée)
router.get('/market-trends', authMiddleware, aiController.getMarketTrends);

// 4. Suggestion de prix pour un produit (Fournisseurs)
router.post('/suggest-price', authMiddleware, authorize(['fournisseur', 'admin']), aiController.suggestPrice);

// 5. Médiation IA pour un litige (Admin ou parties concernées)
router.post('/mediate', authMiddleware, aiController.mediateDispute);

// 6. Chat libre avec l'assistant BCA (Optionnel : authentifié pour le contexte, sinon mode invité)
router.post('/chat', (req, res, next) => {
    // Tentative d'authentification mais on ne bloque pas si absent
    const jwt = require('jsonwebtoken');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET || 'bca_connect_super_secret_fallback_key_2024');
        } catch (e) { /* ignore */ }
    }
    next();
}, aiController.chat);

module.exports = router;
