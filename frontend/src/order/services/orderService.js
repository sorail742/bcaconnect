import api from '../../services/api';
import { offlineStorage } from '../../lib/db';
import deliveryService from '../../delivery/services/deliveryService';

const orderService = {
    getAll: async () => {
        if (!navigator.onLine) {
            return await offlineStorage.getTransactions(); // Note: we can use transactions or a dedicated store
        }
        try {
            const response = await api.get('/orders/me');
            const orders = response.data;
            // Cache pour la consultation offline
            offlineStorage.saveTransactions(orders).catch(e => console.warn("Erreur cache orders:", e));
            return orders;
        } catch (error) {
            return await offlineStorage.getTransactions();
        }
    },

    getVendorOrders: async () => {
        const response = await api.get('/orders/vendor');
        return response.data;
    },

    getAllAdmin: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    create: async (orderData) => {
        if (!navigator.onLine) {
            const payload = { ...orderData, mode_resilience: true, paymentMethod: orderData.paymentMethod || 'cod' };
            const id = await offlineStorage.queueOrder(payload);
            return {
                id,
                offline: true,
                message: "Commande enregistrée en local. Elle sera synchronisée dès le retour d'Internet.",
                ...payload
            };
        }
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    updateStatus: async (orderId, statut) => {
        const response = await api.patch(`/orders/${orderId}/status`, { statut });
        return response.data;
    },

    updateItemStatus: async (itemId, statut) => {
        const response = await api.patch(`/orders/items/${itemId}/status`, { statut });
        return response.data;
    },

    prepareVendorOrder: async (orderId) => {
        const response = await api.post(`/orders/${orderId}/vendor-prepare`);
        return response.data;
    },

    getVendorOrderLogistics: async (orderId) => {
        const response = await api.get(`/orders/${orderId}/vendor-logistics`);
        return response.data;
    },

    getById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    getTracking: async (orderId) => deliveryService.getHistory(orderId),

    getMyVendorsMap: async () => {
        const response = await api.get('/orders/me/vendors-map');
        return response.data;
    },
};

export default orderService;
