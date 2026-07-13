import api from './api';

const statService = {
    getGlobalKPIs: async () => {
        try {
            const response = await api.get('/stats/admin');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getAdminStats: async () => {
        // Endpoint AUTHENTIFIÉ (admin) : renvoie stats réelles (GMV, utilisateurs,
        // transactions), overview, weeklyChart et transactions récentes.
        // NB : /stats/admin/public ne renvoie que des stats agrégées vitrine.
        const response = await api.get('/stats/admin');
        return response.data;
    },
    getLandingStats: async () => {
        try {
            const response = await api.get('/stats/admin/public', { timeout: 8000, _bg: true });
            return response.data;
        } catch {
            return null;
        }
    },
    getFinancialStats: async () => {
        try {
            const response = await api.get('/stats/financial');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getVendorStats: async () => {
        try {
            const response = await api.get('/stats/vendor');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getTrends: async (params = {}) => {
        try {
            const response = await api.get('/stats/trends', { params, timeout: 8000, _bg: true });
            return response.data;
        } catch {
            return null;
        }
    },
    getAiLogs: async () => {
        try {
            const response = await api.get('/stats/ai-logs');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default statService;
