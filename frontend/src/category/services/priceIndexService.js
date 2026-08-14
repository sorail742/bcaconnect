import api from '../../services/api';

const priceIndexService = {
    getByCategory: async (categorieId, months = 6) => {
        const response = await api.get(`/price-index/category/${categorieId}`, { params: { months } });
        return response.data;
    },
    getByProduct: async (produitId, months = 6) => {
        const response = await api.get(`/price-index/product/${produitId}`, { params: { months } });
        return response.data;
    },
};

export default priceIndexService;
