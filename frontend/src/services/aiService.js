import api from './api';

/**
 * Service IA pour la recherche intelligente
 */
export const aiService = {
    /**
     * Interpréter une requête de recherche avec l'IA
     * Retourne l'interprétation, les mots-clés et la catégorie
     */
    interpretSearch: async (query) => {
        try {
            const response = await api.post('/ai/search/interpret', {
                query,
                language: 'fr'
            });
            return response.data;
        } catch (error) {
            console.error('Erreur interprétation recherche:', error);
            throw error;
        }
    },

    /**
     * Trouver des produits similaires basé sur une description
     */
    findSimilarProducts: async (description) => {
        try {
            const response = await api.post('/ai/search/similar', {
                description
            });
            return response.data;
        } catch (error) {
            console.error('Erreur recherche similaire:', error);
            throw error;
        }
    },

    /**
     * Analyser une image pour la recherche
     */
    analyzeImage: async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await api.post('/ai/search/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur analyse image:', error);
            throw error;
        }
    },

    /**
     * Chat avec l'IA pour l'assistance
     */
    chat: async (message) => {
        try {
            const response = await api.post('/ai/chat', { message });
            return response.data;
        } catch (error) {
            console.error('Erreur chat IA:', error);
            throw error;
        }
    },

    /**
     * Analyse de confiance détaillée via l'IA
     */
    getTrustAnalysis: async () => {
        try {
            const response = await api.get('/ai/trust-score');
            return response.data;
        } catch (error) {
            console.error('Erreur analyse confiance IA:', error);
            throw error;
        }
    },

    /**
     * Insights et audit de vente pour les fournisseurs
     */
    getVendorInsights: async () => {
        try {
            const response = await api.get('/ai/insights');
            return response.data;
        } catch (error) {
            console.error('Erreur insights IA:', error);
            throw error;
        }
    },

    /**
     * Obtenir les tendances du marché analysées par l'IA
     */
    getMarketTrends: async () => {
        try {
            const response = await api.get('/ai/market-trends');
            return response.data;
        } catch (error) {
            console.error('Erreur tendances IA:', error);
            throw error;
        }
    },

    /**
     * Analyser un extrait de code pour détecter les bugs
     */
    analyzeCode: async (code, context = '', language = 'javascript') => {
        try {
            const response = await api.post('/ai/code-analyze', { code, context, language });
            return response.data;
        } catch (error) {
            console.error('Erreur analyse code IA:', error);
            throw error;
        }
    }
};

export default aiService;
