import api from './api';

const orderService = {
    getAll: async () => {
        const response = await api.get('/orders/me');
        return response.data;
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

    getById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    }
};

export default orderService;
