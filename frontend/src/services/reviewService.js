import api from './api';

const reviewService = {
    getEligible: async (produitId) => {
        const response = await api.get('/reviews/eligible', { params: { produit_id: produitId } });
        return response.data;
    },

    create: async ({ produit_id, commande_id, note, commentaire }) => {
        const response = await api.post('/reviews/create', {
            produit_id,
            commande_id,
            note,
            commentaire,
        });
        return response.data;
    },

    getByProduct: async (productId) => {
        const response = await api.get(`/reviews/product/${productId}`);
        return response.data;
    },

    getFeatured: async () => {
        try {
            const response = await api.get('/reviews/featured', { timeout: 8000, _bg: true });
            return response.data;
        } catch {
            return { testimonials: [], avgRating: '0', totalReviews: 0 };
        }
    },
};

export default reviewService;
