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
        try {
            const response = await api.get('/stats/admin/public');
            return response.data;
        } catch (error) {
            throw error;
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
    getTrends: async () => {
        try {
            const response = await api.get('/stats/trends');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default statService;
