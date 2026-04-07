const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware, authorize, optionalAuth } = require('../middlewares/authMiddleware');

// ── Routes IA — BCA Connect Intelligence ─────────────────────────────────────

// Ajouter les headers CORS explicitement pour les routes publiques
router.options('/search/interpret', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

router.options('/search/similar', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

router.options('/search/image', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

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

// 6. Chat libre avec l'assistant BCA (optionalAuth : contexte si connecté, mode invité sinon)
router.post('/chat', optionalAuth, aiController.chat);

// 7. Interpréter une requête de recherche
router.post('/search/interpret', aiController.interpretSearch);

// 8. Trouver des produits similaires
router.post('/search/similar', aiController.findSimilarProducts);

// 9. Analyser une image pour la recherche
router.post('/search/image', aiController.analyzeImage);

module.exports = router;
