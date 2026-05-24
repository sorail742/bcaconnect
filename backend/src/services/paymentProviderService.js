const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const PAYMENT_API_KEY = process.env.PAYMENT_API_KEY;
const PAYMENT_SITE_ID = process.env.PAYMENT_SITE_ID;
const PAYMENT_SECRET = process.env.PAYMENT_SECRET;
const BASE_URL = process.env.PAYMENT_PROVIDER_URL || 'https://api-checkout.cinetpay.com/v2/payment';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const paymentProviderService = {
    /**
     * Génère une URL de paiement ou retourne l'URL locale de simulation en mode dev.
     */
    generatePaymentUrl: async (transactionId, montant, description, userPhone) => {
        // Mode Simulation si les clés d'API ne sont pas configurées
        if (!PAYMENT_API_KEY || !PAYMENT_SITE_ID) {
            console.log('🟡 [PAYMENT] Clés API non configurées. Utilisation du mode Simulation.');
            return `${FRONTEND_URL}/payment/simulate/${transactionId}`;
        }

        try {
            const payload = {
                apikey: PAYMENT_API_KEY,
                site_id: PAYMENT_SITE_ID,
                transaction_id: transactionId,
                amount: Math.round(montant), // Le montant doit être un entier
                currency: 'GNF',
                description: description || `Recharge BCA Connect - ${transactionId}`,
                customer_phone_number: userPhone || '',
                return_url: `${FRONTEND_URL}/wallet?status=success&tx=${transactionId}`,
                notify_url: `${BACKEND_URL}/api/payment/webhook`,
                channels: 'ALL' // Permet Mobile Money, Cartes, etc.
            };

            const response = await axios.post(BASE_URL, payload);

            if (response.data && response.data.code === '201') {
                return response.data.data.payment_url;
            } else {
                console.error('🔴 [PAYMENT API ERREUR]', response.data);
                throw new Error("Erreur lors de la génération de l'URL de paiement.");
            }
        } catch (error) {
            console.error('🔴 [PAYMENT SERVICE ERREUR]', error.response?.data || error.message);
            // Fallback sur le mode simulation en cas de crash de l'API externe pour ne pas bloquer l'utilisateur
            console.log('🟡 [PAYMENT] Fallback sur le mode simulation suite à une erreur.');
            return `${FRONTEND_URL}/payment/simulate/${transactionId}`;
        }
    },

    /**
     * Vérifie l'authenticité d'un webhook entrant.
     * Adapté au format HMAC classique (CinetPay, etc.)
     */
    verifyWebhookSignature: (req) => {
        // En mode simulation (sans clé secrète configurée), on autorise toutes les requêtes locales
        if (!PAYMENT_SECRET) {
            return true; 
        }

        const signature = req.headers['x-token'] || req.headers['signature'];
        if (!signature) return false;

        // Exemple de vérification HMAC SHA256 du body
        try {
            const payloadString = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', PAYMENT_SECRET)
                .update(payloadString)
                .digest('hex');

            return signature === expectedSignature;
        } catch (error) {
            console.error('🔴 [WEBHOOK SIGNATURE ERROR]', error);
            return false;
        }
    }
};

module.exports = paymentProviderService;
