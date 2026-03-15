const aiService = require('../services/aiService');
const { Store } = require('../models');

const aiController = {
    // 1. Insights de vente pour les fournisseurs
    getSalesInsights: async (req, res, next) => {
        try {
            // Trouver la boutique de l'utilisateur (fournisseur)
            const store = await Store.findOne({ where: { proprietaire_id: req.user.id } });
            if (!store) {
                return res.status(404).json({ message: "Boutique non trouvée." });
            }

            const insights = await aiService.analyzeSales(store.id);
            res.json(insights);
        } catch (error) {
            next(error);
        }
    },

    // 2. Score de confiance pour le profil
    getTrustAnalysis: async (req, res, next) => {
        try {
            const analysis = await aiService.evaluateTrustScore(req.user.id);
            res.json(analysis);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = aiController;
