import api from '../../services/api';

const educationService = {
    getAll: async () => {
        const res = await api.get('/education');
        return res.data;
    },

    getAllAdmin: async () => {
        const res = await api.get('/education/admin');
        return res.data;
    },

    create: async (data) => {
        const res = await api.post('/education', data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await api.put(`/education/${id}`, data);
        return res.data;
    },

    delete: async (id, confirmationText) => {
        const res = await api.delete(`/education/${id}`, { data: { confirmation_nom: confirmationText } });
        return res.data;
    },
};

export default educationService;
