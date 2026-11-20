import api from '../../services/api';

const alertThresholdService = {
    getMine: async () => (await api.get('/alert-thresholds/mine')).data,
    createOrUpdate: async (data) => (await api.post('/alert-thresholds', data)).data,
    toggle: async (id, actif) => (await api.patch(`/alert-thresholds/${id}/toggle`, { actif })).data,
    delete: async (id) => (await api.delete(`/alert-thresholds/${id}`)).data,
};

export default alertThresholdService;
