import api from '../../services/api';

const partnerStockService = {
    listByProduct: async (produitId) => {
        const response = await api.get(`/partner-stock/product/${produitId}`);
        return response.data;
    },

    getTotalStock: async (produitId) => {
        const response = await api.get(`/partner-stock/product/${produitId}/total`);
        return response.data;
    },

    create: async (produitId, data) => {
        const response = await api.post(`/partner-stock/product/${produitId}`, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/partner-stock/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/partner-stock/${id}`);
        return response.data;
    },
};

export default partnerStockService;
