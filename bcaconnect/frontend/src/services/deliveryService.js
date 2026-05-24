import api from './api';

const deliveryService = {
    // Liste des commandes prêtes pour ramassage (Transporteur)
    getAvailableOrders: async () => {
        const response = await api.get('/delivery/available');
        return response.data;
    },

    // S'assigner une commande (Transporteur)
    assignOrder: async (orderId) => {
        const response = await api.post('/delivery/assign', { orderId });
        return response.data;
    },

    // Lister les livraisons assignées au transporteur connecté
    getMyDeliveries: async () => {
        const response = await api.get('/delivery/mine');
        return response.data;
    },

    // Mettre à jour la position GPS et le statut (Transporteur)
    updateTracking: async (trackingData) => {
        // trackingData: { orderId, latitude, longitude, status, commentaire }
        const response = await api.post('/delivery/tracking', trackingData);
        return response.data;
    },

    // Vérifier et clôturer la livraison avec OTP (Transporteur)
    verifyDelivery: async (orderId, otp) => {
        const response = await api.post('/delivery/verify', { orderId, otp });
        return response.data;
    },

    // Récupérer l'historique de tracking (Client/All)
    getHistory: async (orderId) => {
        const response = await api.get(`/delivery/history/${orderId}`);
        return response.data;
    }
};

export default deliveryService;
