import api from './api';

const statService = {
    getAdminStats: async () => {
        try {
            const response = await api.get('/stats/admin');
            return response.data;
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            throw error;
        }
    },
    getFinancialStats: async () => {
        try {
            const response = await api.get('/stats/financial');
            return response.data;
        } catch (error) {
            console.error('Error fetching financial stats:', error);
            throw error;
        }
    },
    getVendorStats: async () => {
        try {
            const response = await api.get('/stats/vendor');
            return response.data;
        } catch (error) {
            console.error('Error fetching vendor stats:', error);
            throw error;
        }
    }
};

export default statService;
