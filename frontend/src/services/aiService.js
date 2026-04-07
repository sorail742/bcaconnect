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
            const response = await api.post('/ai/chat', {
                message
            });
            return response.data;
        } catch (error) {
            console.error('Erreur chat IA:', error);
            throw error;
        }
    }
};

export default aiService;
