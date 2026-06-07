const axios = require('axios');

const API_URL = process.env.API_URL || 'http://127.0.0.1:5001/api';

const testUtils = {
    async registerUser(userData) {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, userData);
            return res.data;
        } catch (error) {
            if (error.response?.data?.message?.includes('déjà utilisé')) {
                return this.loginUser({ email: userData.email, mot_de_passe: userData.mot_de_passe });
            }
            throw error;
        }
    },

    async loginUser(credentials) {
        const res = await axios.post(`${API_URL}/auth/login`, credentials);
        return {
            token: res.data.token,
            authHeader: { headers: { Authorization: `Bearer ${res.data.token}` } },
        };
    },

    async createTestActors() {
        const timestamp = Date.now();

        await this.registerUser({
            nom_complet: 'Vendeur Test',
            email: `vendeur-${timestamp}@test.com`,
            telephone: `01${Math.floor(Math.random() * 10000000)}`,
            mot_de_passe: 'pass123',
            role: 'fournisseur',
        });
        const sellerAuth = await this.loginUser({ email: `vendeur-${timestamp}@test.com`, mot_de_passe: 'pass123' });

        await this.registerUser({
            nom_complet: 'Client Test',
            email: `client-${timestamp}@test.com`,
            telephone: `07${Math.floor(Math.random() * 10000000)}`,
            mot_de_passe: 'pass123',
            role: 'client',
        });
        const clientAuth = await this.loginUser({ email: `client-${timestamp}@test.com`, mot_de_passe: 'pass123' });

        await this.registerUser({
            nom_complet: 'Livreur Test',
            email: `carrier-${timestamp}@test.com`,
            telephone: `05${Math.floor(Math.random() * 10000000)}`,
            mot_de_passe: 'pass123',
            role: 'transporteur',
        });
        const carrierAuth = await this.loginUser({ email: `carrier-${timestamp}@test.com`, mot_de_passe: 'pass123' });

        return { sellerAuth, clientAuth, carrierAuth };
    },

    async creditWallet(auth, amount) {
        const initRes = await axios.post(`${API_URL}/payments/initiate`, {
            montant: amount,
            moyen_paiement: 'mobile_money',
        }, auth.authHeader);

        const transactionId = initRes.data.transaction_id;

        if (initRes.data.payment_url?.includes('/payment/simulate/')) {
            await axios.post(`${API_URL}/payments/capture-simulation`, {
                transaction_id: transactionId,
            }, auth.authHeader);
        } else {
            await axios.post(`${API_URL}/payments/webhook`, {
                transaction_id: transactionId,
                status: 'success',
            });
        }

        console.log(`💰 Portefeuille crédité de ${amount} GNF.`);
    },
};

module.exports = testUtils;
