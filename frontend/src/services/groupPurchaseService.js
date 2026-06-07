import api from './api';

const groupPurchaseService = {
    list: async (params = {}) => {
        const response = await api.get('/group-purchases', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/group-purchases/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/group-purchases', data);
        return response.data;
    },

    join: async (id, quantite) => {
        const response = await api.post(`/group-purchases/${id}/join`, { quantite });
        return response.data;
    },

    leave: async (id) => {
        const response = await api.delete(`/group-purchases/${id}/leave`);
        return response.data;
    },

    close: async (id) => {
        const response = await api.post(`/group-purchases/${id}/close`);
        return response.data;
    },
};

export default groupPurchaseService;
