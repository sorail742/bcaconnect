import api from '../../services/api';

const disputeService = {
    getMyDisputes: async () => {
        const response = await api.get('/disputes/my');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/disputes/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/disputes', data);
        return response.data;
    },

    respond: async (id, message) => {
        const response = await api.post(`/disputes/${id}/respond`, { message });
        return response.data;
    },

    acceptProposal: async (id) => {
        const response = await api.post(`/disputes/${id}/accept-proposal`);
        return response.data;
    },

    escalate: async (id, motif) => {
        const response = await api.post(`/disputes/${id}/escalate`, { motif });
        return response.data;
    },
};

export default disputeService;
