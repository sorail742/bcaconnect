import api from '../../services/api';

/**
 * Service pour la gestion des crédits et du financement IA (BCA Fin v2.6)
 */
const creditService = {
    /**
     * Simule un crédit (calcul mensualités, taux, etc.)
     * @param {Object} data { montant, duree_mois, type_credit }
     */
    simulate: async (data) => {
        try {
            const response = await api.post('/credits/simulate', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Soumet une demande de crédit avec analyse IA
     * @param {Object} payload { montant, duree_mois, motif, garanties }
     */
    request: async (payload) => {
        try {
            const response = await api.post('/credits/request', payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupère les crédits de l'utilisateur connecté
     */
    getScore: async () => {
        const response = await api.get('/credits/score');
        return response.data;
    },
    getMyCredits: async () => {
        try {
            const response = await api.get('/credits/my');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Paye une mensualité spécifique via le Wallet
     * @param {string} id ID du crédit ou de la mensualité
     */
    payInstallment: async (id) => {
        try {
            const response = await api.post(`/credits/pay/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getPending: async () => {
        const response = await api.get('/credits/pending');
        return response.data;
    },

    getApplicantsMap: async () => {
        const response = await api.get('/credits/applicants-map');
        return response.data;
    },

    approve: async (id) => {
        const response = await api.put(`/credits/${id}/approve`);
        return response.data;
    },

    reject: async (id, motif_refus) => {
        const response = await api.put(`/credits/${id}/reject`, { motif_refus });
        return response.data;
    },

    /**
     * Micro-prêt (sous-bancarisés) — plafonds réels et seuil d'approbation
     * automatique, pour affichage dynamique côté formulaire.
     */
    getMicroConfig: async () => {
        const response = await api.get('/credits/micro/config');
        return response.data;
    },

    requestMicro: async (payload) => {
        const response = await api.post('/credits/micro/request', payload);
        return response.data;
    },
};

export default creditService;
