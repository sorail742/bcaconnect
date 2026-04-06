import axios from 'axios';

import { API_BASE_URL } from '../constants/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs globales (ex: 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optionnel : ne pas forcer la redirection brute car cela casse l'accès aux pages publiques !
            localStorage.removeItem('token');
            // La redirection est gérée délicatement par le composant ProtectedRoute
        }
        return Promise.reject(error);
    }
);

export default api;
