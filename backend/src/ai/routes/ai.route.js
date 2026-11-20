const express = require('express');
const router = express.Router();
const aiController = require('../controller/ai.controller');
const { authMiddleware, authorize, optionalAuth } = require('../../middlewares/authMiddleware');
const multer = require('multer');

// Configuration Multer pour les images (Stockage en mémoire)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limite 5MB
});

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

// 3. Tendances du marché guinéen (Mode public activé pour la Landing Page)
router.get('/market-trends', optionalAuth, aiController.getMarketTrends);

// 4. Suggestion de prix pour un produit (Fournisseurs)
router.post('/suggest-price', authMiddleware, authorize(['fournisseur', 'admin']), aiController.suggestPrice);

// 5. Médiation IA pour un litige (Admin ou parties concernées)
router.post('/mediate', authMiddleware, aiController.mediateDispute);

// 6. Chat libre avec l'assistant BCA (optionalAuth : contexte si connecté, mode invité sinon)
router.post('/chat', optionalAuth, aiController.chat);

// 6b-d. Historique réel des discussions IA (connecté uniquement)
router.get('/conversations', authMiddleware, aiController.getConversations);
router.get('/conversations/:id/messages', authMiddleware, aiController.getConversationMessages);
router.delete('/conversations/:id', authMiddleware, aiController.deleteConversation);

// 7. Interpréter une requête de recherche
router.post('/search/interpret', aiController.interpretSearch);

// 8. Trouver des produits similaires
router.post('/search/similar', aiController.findSimilarProducts);

// 9. Analyser une image pour la recherche
router.post('/search/image', upload.single('image'), aiController.analyzeImage);

// 10. Suggérer les détails complets d'un produit (Fournisseurs)
router.post('/suggest-details', authMiddleware, authorize(['fournisseur', 'admin']), aiController.suggestProductDetails);

// 11. Suggérer une description pour une catégorie (Admin)
router.post('/suggest-category-description', authMiddleware, authorize(['admin']), aiController.suggestCategoryDescription);

// 11b. Suggérer les détails d'une ressource éducative (Admin)
router.post('/suggest-education-details', authMiddleware, authorize(['admin']), aiController.suggestEducationDetails);

// 12. Analyser du code pour détecter les bugs (mode développeur)
router.post('/code-analyze', optionalAuth, aiController.analyzeCode);

module.exports = router;
