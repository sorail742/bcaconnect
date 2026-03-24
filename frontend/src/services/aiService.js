import api from './api';

const aiService = {

    // 1. Insights de ventes (vendeur)
    getSalesInsights: async () => {
        if (!navigator.onLine) {
            return {
                ia_conseil: "Mode Hors-ligne : Connectez-vous pour obtenir des recommandations IA personnalisées.",
                recommendations: [],
                global_trend: "Indisponible hors-ligne"
            };
        }
        const response = await api.get('/ai/insights');
        return response.data;
    },

    // 2. Score de confiance utilisateur
    getTrustAnalysis: async () => {
        if (!navigator.onLine) {
            return { score: 75, level: "Mode Hors-ligne", conseils: [] };
        }
        const response = await api.get('/ai/trust-score');
        return response.data;
    },

    // 3. Tendances du marché guinéen
    getMarketTrends: async () => {
        const response = await api.get('/ai/market-trends');
        return response.data;
    },

    // 4. Suggestion de prix pour un produit
    suggestPrice: async (nom, categorie, description = '') => {
        const response = await api.post('/ai/suggest-price', { nom, categorie, description });
        return response.data;
    },

    // 5. Médiation de litige
    mediateDispute: async (type, description, montant, statut_commande) => {
        const response = await api.post('/ai/mediate', { type, description, montant, statut_commande });
        return response.data;
    },

    // 6. Chat avec l'assistant BCA
    chat: async (message) => {
        const response = await api.post('/ai/chat', { message });
        return response.data;
    }
};

export default aiService;
