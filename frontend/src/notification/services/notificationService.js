import api from '../../services/api';
import { offlineStorage } from '../../lib/db';

const notificationService = {
    // Récupérer toutes les notifications — préchargées en cache local pour
    // consultation hors ligne (cahier des charges 3.6).
    getAll: async (config = {}) => {
        if (!navigator.onLine) {
            return offlineStorage.getNotifications();
        }
        try {
            const response = await api.get('/notifications', { ...config });
            const data = response.data;
            if (Array.isArray(data)) {
                offlineStorage.saveNotifications(data).catch(err => console.error('Erreur cache notifications:', err));
            }
            return data;
        } catch {
            const cached = await offlineStorage.getNotifications();
            if (cached?.length) return cached;
            return [];
        }
    },

    // Marquer comme lue
    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    // Tout marquer comme lu
    markAllAsRead: async () => {
        const response = await api.post('/notifications/mark-all-read');
        return response.data;
    },

    // Supprimer une notification
    delete: async (id, confirmationText) => {
        const response = await api.delete(`/notifications/${id}`, { data: { confirmation_nom: confirmationText } });
        return response.data;
    }
};

export default notificationService;
