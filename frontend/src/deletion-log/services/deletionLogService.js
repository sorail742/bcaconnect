import api from '../../services/api';

const deletionLogService = {
    getAll: async (params = {}) => {
        const response = await api.get('/deletion-history', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/deletion-history/${id}`);
        return response.data;
    },

    restore: async (id) => {
        const response = await api.post(`/deletion-history/${id}/restore`);
        return response.data;
    },
};

export default deletionLogService;
