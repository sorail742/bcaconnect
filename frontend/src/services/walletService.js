import api from './api';

const walletService = {
    getMyWallet: async () => {
        const response = await api.get('/wallet/me');
        return response.data;
    },

    getTransactions: async () => {
        const response = await api.get('/wallet/transactions');
        return response.data;
    },

    initiateDeposit: async (depositData) => {
        const response = await api.post('/payments/initiate', depositData);
        return response.data;
    },

    getAllTransactions: async () => {
        const response = await api.get('/wallet/all');
        return response.data;
    }
};

export default walletService;
