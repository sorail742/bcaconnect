import api from '../../services/api';

/**
 * Service pour la gestion du support et du SAV (BCA Support v2.6)
 */
const supportService = {
    /**
     * Crée un nouveau ticket de support
     * @param {Object} data { sujet, message, categorie, priorité }
     */
    createTicket: async (data) => {
        try {
            const response = await api.post('/support/tickets', data);
            return response.data;
        } catch (error) {
            console.error('Erreur création ticket:', error);
            throw error;
        }
    },

    /**
     * Récupère les tickets de l'utilisateur connecté
     */
    getMyTickets: async () => {
        try {
            const response = await api.get('/support/tickets/me');
            return response.data;
        } catch (error) {
            console.error('Erreur récupération tickets:', error);
            throw error;
        }
    },

    /**
     * Résout un ticket (Action Administrateur)
     * @param {string} id ID du ticket
     */
    resolveTicket: async (id) => {
        try {
            const response = await api.put(`/support/tickets/${id}/resolve`);
            return response.data;
        } catch (error) {
            console.error('Erreur résolution ticket:', error);
            throw error;
        }
    }
};

export default supportService;
