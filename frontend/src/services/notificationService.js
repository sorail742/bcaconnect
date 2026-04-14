import api from './api';

const notificationService = {
    // Récupérer toutes les notifications
    getAll: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            return [];
        }
    },

    // Marquer comme lue
    markAsRead: async (id) => {
        try {
            const response = await api.patch(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Tout marquer comme lu
    markAllAsRead: async () => {
        try {
            const response = await api.post('/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Supprimer une notification
    delete: async (id) => {
        try {
            const response = await api.delete(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default notificationService;
