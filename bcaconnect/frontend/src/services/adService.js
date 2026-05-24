import api from './api';

const adService = {
    getAll: async () => {
        const response = await api.get('/ads');
        return response.data;
    },

    getActive: async () => {
        const response = await api.get('/ads?status=actif');
        return response.data;
    },

    getHeroSlides: async () => {
        // Supposons que les slides hero sont des publicités avec un tag spécifique
        const response = await api.get('/ads?position=hero');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/ads/${id}`);
        return response.data;
    }
};

export default adService;
