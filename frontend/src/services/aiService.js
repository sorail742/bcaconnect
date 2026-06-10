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

    getMarketTrends: async () => {
        try {
            const response = await api.get('/ai/market-trends', { timeout: 8000, _bg: true });
            return response.data;
        } catch {
            return null;
        }
    },

    /**
     * Suggérer un prix pour un nouveau produit
     */
    suggestPrice: async (nom_produit, categorie, description) => {
        try {
            const response = await api.post('/ai/suggest-price', { nom: nom_produit, categorie, description });
            return response.data;
        } catch (error) {
            console.error('Erreur suggestion prix IA:', error);
            throw error;
        }
    },

    /**
     * Suggérer tous les détails d'un produit (Magic Fill)
     */
    suggestProductDetails: async (nom, imageAnalysis, categorie = '') => {
        try {
            const response = await api.post('/ai/suggest-details', { nom, imageAnalysis, categorie });
            return response.data;
        } catch (error) {
            console.error('Erreur suggestion détails IA:', error);
            throw error;
        }
    },

    /**
     * Générer une description technique pour une catégorie
     */
    generateCategoryDescription: async (nom_categorie) => {
        try {
            const response = await api.post('/ai/suggest-category-description', { nom: nom_categorie });
            return response.data;
        } catch (error) {
            console.error('Erreur génération description catégorie IA:', error);
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
