import api from '../../services/api';

const auditLogService = {
    getAll: async (params = {}) => {
        const response = await api.get('/audit-logs', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/audit-logs/${id}`);
        return response.data;
    },

    getUserSummary: async (userId) => {
        const response = await api.get(`/audit-logs/user/${userId}/summary`);
        return response.data;
    },
};

export default auditLogService;
