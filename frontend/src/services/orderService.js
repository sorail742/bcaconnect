import api from './api';

const orderService = {
    getMyOrders: async () => {
        const response = await api.get('/orders/me');
        return response.data;
    },

    getVendorOrders: async () => {
        const response = await api.get('/orders/vendor');
        return response.data;
    },

    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    updateOrderStatus: async (orderId, statut) => {
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
