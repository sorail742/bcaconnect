import api from './api';

const storeService = {
    getMyStore: async () => {
        const response = await api.get('/stores/me');
        return response.data;
    },

    createStore: async (storeData) => {
        const response = await api.post('/stores', storeData);
        return response.data;
    },

    getAllStores: async () => {
        const response = await api.get('/stores');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/stores/${id}`);
        return response.data;
    }
};

export default storeService;
