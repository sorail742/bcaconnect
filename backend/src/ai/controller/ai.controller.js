const catchAsync = require('../../utils/catchAsync');
const aiService = require('../service/ai.service');

const aiController = {

    // 1. Insights de vente pour les fournisseurs (alimenté par Groq)
    getSalesInsights: catchAsync(async (req, res) => {
        const result = await aiService.getSalesInsights(req.user.id);
        if (result.outcome === 'no_store') {
            return res.status(404).json({ ia_conseil: "Vous n'avez pas de boutique active." });
        }
        res.json(result.data);
    }),

    // 2. Analyse du score de confiance et conseils pour l'utilisateur
    getTrustAnalysis: catchAsync(async (req, res) => {
        const analysis = await aiService.analyzeTrust(req.user.id);
        res.json(analysis);
    }),

    // 3. Tendances du marché local (Guinée)
    getMarketTrends: catchAsync(async (req, res) => {
        const trends = await aiService.getMarketTrends();
        res.json(trends);
    }),

    // 4. Suggestion intelligente de prix lors de la création d'un produit
    suggestPrice: catchAsync(async (req, res) => {
        const { nom, categorie, description } = req.body;
        if (!nom || !categorie) {
            return res.status(400).json({ message: "Nom et catégorie requis." });
        }
        const suggestion = await aiService.getSmartPricing(nom, categorie, description);
        res.json(suggestion);
    }),

    // 5. Médiation de litige assistée par IA
    mediateDispute: catchAsync(async (req, res) => {
        const { disputeId, details } = req.body;
        const mediation = await aiService.mediateDispute({ ...details, disputeId });
        res.json(mediation);
    }),

    // 6. Chat libre avec l'assistant BCA (Optionnel : authentifié pour le contexte, sinon mode invité)
    chat: async (req, res) => {
        try {
            const { message, conversation_id } = req.body;
            if (!message) {
                return res.status(400).json({ message: "Message requis." });
            }

            const result = await aiService.chat({ user: req.user, message, conversation_id });
            res.json(result);
        } catch (error) {
            console.error('[AI Chat Error]', error.message);
            res.status(500).json({
                message: "Désolé, je suis momentanément indisponible.",
                error: error.message
            });
        }
    },

    // 6b. Historique réel des discussions IA de l'utilisateur (sidebar façon ChatGPT/Gemini)
    getConversations: catchAsync(async (req, res) => {
        const result = await aiService.getConversations(req.user.id);
        res.json(result);
    }),

    // 6c. Messages complets d'une discussion IA (rechargement au clic dans l'historique)
    getConversationMessages: catchAsync(async (req, res) => {
        const result = await aiService.getConversationMessages(req.user.id, req.params.id);
        if (!result) return res.status(404).json({ message: 'Discussion introuvable.' });
        res.json(result);
    }),

    // 6d. Supprimer une discussion IA (journalisée dans l'historique des suppressions)
    deleteConversation: catchAsync(async (req, res) => {
        const deleted = await aiService.deleteConversation(req.user.id, req.params.id, req);
        if (!deleted) return res.status(404).json({ message: 'Discussion introuvable.' });
        res.json({ message: 'Discussion supprimée.' });
    }),

    // 7. Interpréter une requête de recherche
    interpretSearch: async (req, res, next) => {
        try {
            const { query } = req.body;
            if (!query) {
                return res.status(400).json({ message: "Requête requise." });
            }

            const result = await aiService.interpretSearchRequest(query);
            res.json(result);
        } catch (error) {
            console.error('[AI Interpret Search Error]', error);
            next(error);
        }
    },

    // 8. Trouver des produits similaires
    findSimilarProducts: catchAsync(async (req, res) => {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: "Description requise." });
        }

        const results = await aiService.findSimilarProducts(description);
        res.json({ data: results });
    }),

    // 9. Analyser une image pour la recherche
    analyzeImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Image requise." });
            }

            const result = await aiService.analyzeImageSearch(req.file);
            res.json(result);
        } catch (error) {
            console.error('[Image Analysis Error]', error.message);
            res.status(500).json({ message: "Erreur analyse image", error: error.message });
        }
    },

    // 10. Suggérer les détails complets d'un produit pour auto-fill
    suggestProductDetails: catchAsync(async (req, res) => {
        const { nom, imageAnalysis, categorie } = req.body;
        const details = await aiService.generateProductDetails(nom, imageAnalysis, categorie || '');
        res.json(details);
    }),

    // 11. Suggérer une description pour une catégorie
    suggestCategoryDescription: catchAsync(async (req, res) => {
        const { nom } = req.body;
        const details = await aiService.generateCategoryDescription(nom);
        res.json(details);
    }),

    // 11b. Suggérer les détails d'une ressource éducative
    suggestEducationDetails: catchAsync(async (req, res) => {
        const { url, type } = req.body;
        const details = await aiService.generateEducationDetails(url, type);
        res.json(details);
    }),

    // 12. Analyse de code pour le débogage de la plateforme
    analyzeCode: async (req, res) => {
        try {
            const { code, context, language = 'javascript' } = req.body;
            if (!code) {
                return res.status(400).json({ message: "Code requis." });
            }

            const result = await aiService.analyzeCode({ code, context, language });
            res.json(result);
        } catch (error) {
            console.error('[Code Analysis Error]', error.message);
            res.status(500).json({
                message: "Erreur lors de l'analyse du code.",
                error: error.message
            });
        }
    }
};

module.exports = aiController;
