import api from '../../services/api';

const productVariantService = {
    getForProduct: async (productId) => {
        const response = await api.get(`/product-variants/product/${productId}`);
        return response.data;
    },

    create: async (productId, data) => {
        const response = await api.post(`/product-variants/product/${productId}`, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/product-variants/${id}`, data);
        return response.data;
    },

    remove: async (id) => {
        const response = await api.delete(`/product-variants/${id}`);
        return response.data;
    },
};

export default productVariantService;
