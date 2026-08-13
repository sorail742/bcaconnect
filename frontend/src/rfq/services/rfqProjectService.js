import api from '../../services/api';

const rfqProjectService = {
    create: async (data) => (await api.post('/rfq/project', data)).data,
    getById: async (id) => (await api.get(`/rfq/${id}`)).data,
    getOpen: async () => (await api.get('/rfq/open')).data,
    getMine: async () => (await api.get('/rfq/mine')).data,
    submitQuote: async (id, data) => (await api.post(`/rfq/${id}/project-quotes`, data)).data,
    getComparison: async (id) => (await api.get(`/rfq/${id}/comparison`)).data,
    acceptQuote: async (id, quoteId) => (await api.put(`/rfq/${id}/quotes/${quoteId}/accept`)).data,
};

export default rfqProjectService;
