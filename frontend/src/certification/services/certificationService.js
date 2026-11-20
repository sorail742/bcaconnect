import api from '../../services/api';

const certificationService = {
    create: async (data) => {
        const response = await api.post('/certifications', data);
        return response.data;
    },

    getMine: async () => {
        const response = await api.get('/certifications/mine');
        return response.data;
    },

    getAll: async (params = {}) => {
        const response = await api.get('/certifications', { params });
        return response.data;
    },

    review: async (id, data) => {
        const response = await api.put(`/certifications/${id}/review`, data);
        return response.data;
    },

    getVendorStatus: async (vendorId) => {
        const response = await api.get(`/certifications/vendor/${vendorId}/status`);
        return response.data;
    },
};

export default certificationService;
