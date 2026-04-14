import api from './api';

const walletService = {
    getWallet: async () => {
        const response = await api.get('/wallet');
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
    },

    transfer: async (transferData) => {
        const response = await api.post('/wallet/transfer', transferData);
        return response.data;
    }
};

export default walletService;
