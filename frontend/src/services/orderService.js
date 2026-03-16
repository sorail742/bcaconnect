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
    }
};

export default orderService;
