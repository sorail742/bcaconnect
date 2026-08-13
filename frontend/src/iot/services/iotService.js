import api from '../../services/api';

const iotService = {
    activate: async (orderId, data) => (await api.post(`/iot/devices/${orderId}/activate`, data)).data,
    deactivate: async (orderId) => (await api.post(`/iot/devices/${orderId}/deactivate`)).data,
    getTracking: async (orderId) => (await api.get(`/iot/orders/${orderId}/tracking`)).data,
};

export default iotService;
