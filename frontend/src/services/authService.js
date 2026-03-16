import api from './api';

const authService = {
    login: async (email, mot_de_passe) => {
        const response = await api.post('/auth/login', { email, mot_de_passe });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};

export default authService;
