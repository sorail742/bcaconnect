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

    getCompletedDeliveries: async () => {
        const response = await api.get('/delivery/completed');
        return response.data;
    },

    // Grouper des commandes
    groupOrders: async (orderIds) => {
        const response = await api.post('/delivery/group', { orderIds });
        return response.data;
    },

    // Obtenir les groupes de livraisons
    getMyGroups: async () => {
        const response = await api.get('/delivery/groups/my');
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
    },

    // 🌐 Suivi PUBLIC (sans authentification, données masquées RGPD)
    trackOrder: async (trackingNumber) => {
        const response = await api.get(`/delivery/track/${encodeURIComponent(trackingNumber)}`);
        return response.data;
    },

    /** Suivi authentifié (vendeur, client, transporteur) — données complètes */
    trackOrderForUser: async (orderId) => {
        const [orderRes, historyRes] = await Promise.all([
            api.get(`/orders/${orderId}`),
            api.get(`/delivery/history/${orderId}`),
        ]);
        const order = orderRes.data;
        const history = historyRes.data || [];
        const gpsLogs = history.filter((h) => h.latitude != null && h.longitude != null);
        const last = gpsLogs[gpsLogs.length - 1];
        const lastTs = last?.created_at ?? last?.createdAt;
        return {
            id: order.id,
            trackingRef: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
            statut: order.statut,
            statut_livraison: order.statut_livraison,
            date_commande: order.date_commande,
            nom_destinataire: order.nom_destinataire,
            adresse_livraison: order.adresse_livraison,
            transporteur: order.transporteur,
            history,
            lastPosition: last
                ? {
                    latitude: parseFloat(last.latitude),
                    longitude: parseFloat(last.longitude),
                    updated_at: lastTs,
                }
                : null,
        };
    },

    // Statistiques dashboard transporteur
    getCarrierStats: async () => {
        const response = await api.get('/delivery/stats');
        return response.data;
    },

    getAdminOverview: async () => {
        const response = await api.get('/delivery/admin/overview');
        return response.data;
    },
};

export default deliveryService;
