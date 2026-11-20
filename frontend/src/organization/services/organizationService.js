import api from '../../services/api';

const organizationService = {
    create: async (data) => (await api.post('/organizations', data)).data,
    getMine: async () => (await api.get('/organizations/mine')).data,
    updateThreshold: async (id, plafond_approbation_auto) =>
        (await api.put(`/organizations/${id}/threshold`, { plafond_approbation_auto })).data,
    inviteMember: async (id, email, role_membre) =>
        (await api.post(`/organizations/${id}/members`, { email, role_membre })).data,
    listMembers: async (id) => (await api.get(`/organizations/${id}/members`)).data,
    removeMember: async (id, memberId) => (await api.delete(`/organizations/${id}/members/${memberId}`)).data,

    submitOrderRequest: async (organizationId, orderPayload) =>
        (await api.post(`/organizations/${organizationId}/order-requests`, orderPayload)).data,
    listPendingRequests: async (id) => (await api.get(`/organizations/${id}/order-requests/pending`)).data,
    approveRequest: async (requestId) => (await api.put(`/organizations/order-requests/${requestId}/approve`)).data,
    rejectRequest: async (requestId, commentaire) =>
        (await api.put(`/organizations/order-requests/${requestId}/reject`, { commentaire })).data,
};

export default organizationService;
