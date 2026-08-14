import api from '../../services/api';

const rfqService = {
    create: async (data) => {
        const response = await api.post('/rfq', data);
        return response.data;
    },

    getOpen: async (params = {}) => {
        const response = await api.get('/rfq/open', { params });
        return response.data;
    },

    getMine: async () => {
        const response = await api.get('/rfq/mine');
        return response.data;
    },

    getMyQuotes: async () => {
        const response = await api.get('/rfq/my-quotes');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/rfq/${id}`);
        return response.data;
    },

    submitQuote: async (id, data) => {
        const response = await api.post(`/rfq/${id}/quotes`, data);
        return response.data;
    },

    acceptQuote: async (id, quoteId) => {
        const response = await api.put(`/rfq/${id}/quotes/${quoteId}/accept`);
        return response.data;
    },

    close: async (id) => {
        const response = await api.put(`/rfq/${id}/close`);
        return response.data;
    },
};

export default rfqService;
