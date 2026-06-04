import api from './api';

const storeService = {
    getMyStore: async () => {
        const response = await api.get('/stores/me');
        return response.data;
    },

    create: async (storeData) => {
        const response = await api.post('/stores', storeData);
        return response.data;
    },

    getAll: async (params = {}) => {
        const response = await api.get('/stores', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/stores/${id}`);
        return response.data;
    },

    getBySlug: async (slug) => {
        const response = await api.get(`/stores/slug/${slug}`);
        return response.data;
    },

    updateStore: async (storeData) => {
        const response = await api.put('/stores/me', storeData);
        return response.data;
    }
};

export default storeService;
