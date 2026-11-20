import api from '../../services/api';

const productQuestionService = {
    getForProduct: async (productId) => {
        const response = await api.get(`/product-questions/product/${productId}`);
        return response.data;
    },

    ask: async (productId, question) => {
        const response = await api.post(`/product-questions/product/${productId}`, { question });
        return response.data;
    },

    answer: async (id, reponse) => {
        const response = await api.put(`/product-questions/${id}/answer`, { reponse });
        return response.data;
    },

    markHelpful: async (id) => {
        const response = await api.post(`/product-questions/${id}/helpful`);
        return response.data;
    },

    remove: async (id) => {
        const response = await api.delete(`/product-questions/${id}`);
        return response.data;
    },

    getPendingForVendor: async () => {
        const response = await api.get('/product-questions/vendor/pending');
        return response.data;
    },
};

export default productQuestionService;
