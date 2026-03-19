import api from './api';

const userService = {
    getAll: async (page = 1, limit = 10, search = '', role = '') => {
        const response = await api.get('/users', {
            params: { page, limit, search, role }
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    update: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/users/${id}/status`, { status });
        return response.data;
    }
};

export default userService;
