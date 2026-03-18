import api from './api';

const deliveryService = {
    getAvailableOrders: async () => {
        const response = await api.get('/delivery/available');
        return response.data;
    },

    assignOrder: async (orderId) => {
        const response = await api.post('/delivery/assign', { orderId });
        return response.data;
    },

    updateStatus: async (orderId, status) => {
        const response = await api.patch('/delivery/status', { orderId, status });
        return response.data;
    }
};

export default deliveryService;
