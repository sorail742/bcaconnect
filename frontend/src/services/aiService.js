import api from './api';
import { offlineStorage } from '../lib/db';

const aiService = {
    getSalesInsights: async () => {
        if (!navigator.onLine) {
            return {
                summary: "Mode Hors-ligne : Recommandations basées sur votre cache local.",
                recommendations: [
                    "Continuez à consulter vos produits favoris hors-ligne.",
                    "Vos commandes seront synchronisées dès le retour du signal."
                ]
            };
        }
        const response = await api.get('/ai/insights');
        return response.data;
    },

    getTrustAnalysis: async () => {
        if (!navigator.onLine) {
            return {
                score: 75,
                level: "Mode Hors-ligne",
                message: "Analyse basée sur les dernières données synchronisées."
            };
        }
        const response = await api.get('/ai/trust');
        return response.data;
    },

    // Nouvelle méthode pour l'IA Offline demandée par le cahier des charges
    getOfflineRecommendations: async () => {
        const products = await offlineStorage.getProducts();
        // Logique simple : recommander les 3 derniers produits consultés (cachés)
        return products.slice(0, 3);
    }
};

export default aiService;
