import api from './api';

const authService = {
    /**
     * Authentifie l'utilisateur via email et mot_de_passe.
     * Endpoint: POST /auth/login
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, mot_de_passe: password });
        return response.data;
    },

    googleLogin: async (credential) => {
        const response = await api.post('/auth/google-login', { credential });
        return response.data;
    },

    /**
     * Inscrit un nouvel utilisateur (nom_complet, email, telephone, mot_de_passe, role).
     * Endpoint: POST /auth/register
     */
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Récupère les informations complètes de l'utilisateur connecté via le token dans le Header.
     * Endpoint: GET /auth/me
     */
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    /**
     * Vérifie le code 2FA pour terminer la connexion.
     * @param {string} userId
     * @param {string} code
     */
    verify2FA: async (userId, code) => {
        const response = await api.post('/auth/verify-2fa', { userId, code });
        return response.data;
    },

    /**
     * Initialise la configuration 2FA (génère QR Code).
     */
    setup2FA: async () => {
        const response = await api.get('/auth/setup-2fa');
        return response.data;
    },

    /**
     * Confirme et active la 2FA avec un premier code TOTP.
     * @param {string} code
     */
    confirm2FA: async (code) => {
        const response = await api.post('/auth/confirm-2fa', { code });
        return response.data;
    },

    /**
     * Met à jour le profil de l'utilisateur.
     * Endpoint: PUT /auth/update
     */
    updateProfile: async (userData) => {
        const response = await api.put('/auth/update', userData);
        return response.data;
    },

    /**
     * Supprime le compte de l'utilisateur.
     * Endpoint: DELETE /auth/delete
     */
    deleteAccount: async () => {
        const response = await api.delete('/auth/delete');
        return response.data;
    },

    /**
     * Déconnexion serveur (révoque refresh token) puis nettoyage local.
     */
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Token expiré ou réseau indisponible — on nettoie quand même côté client
        }
    },
};

export default authService;
