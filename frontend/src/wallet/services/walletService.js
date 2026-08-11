import api from '../../services/api';

const walletService = {
    getWallet: async () => {
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

    getAllTransactions: async (params = {}) => {
        const response = await api.get('/wallet/all', { params });
        return response.data;
    },

    transfer: async (transferData) => {
        const response = await api.post('/wallet/transfer', transferData);
        return response.data;
    },

    requestWithdrawal: async (withdrawalData) => {
        const response = await api.post('/wallet/withdraw', withdrawalData);
        return response.data;
    },

    getPendingWithdrawals: async () => {
        const response = await api.get('/wallet/admin/withdrawals');
        return response.data;
    },

    processWithdrawal: async (id, action, notes_admin) => {
        const response = await api.patch(`/wallet/admin/withdrawals/${id}`, { action, notes_admin });
        return response.data;
    },

    captureSimulation: async (transactionId) => {
        const response = await api.post('/payments/capture-simulation', { transaction_id: transactionId });
        return response.data;
    },

    getPaymentStatus: async (transactionId) => {
        const response = await api.get(`/payments/status/${transactionId}`);
        return response.data;
    },
};

export default walletService;
