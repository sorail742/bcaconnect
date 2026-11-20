import api from '../../services/api';

const couponService = {
    validate: async (code, items) => {
        const response = await api.post('/coupons/validate', { code, items });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/coupons', data);
        return response.data;
    },

    getMine: async () => {
        const response = await api.get('/coupons/mine');
        return response.data;
    },

    toggleActive: async (id) => {
        const response = await api.put(`/coupons/${id}/toggle`);
        return response.data;
    },

    getStats: async (id) => {
        const response = await api.get(`/coupons/${id}/stats`);
        return response.data;
    },
};

export default couponService;
