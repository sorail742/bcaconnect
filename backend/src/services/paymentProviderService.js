const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const PAYMENT_API_KEY = process.env.PAYMENT_API_KEY;
const PAYMENT_SITE_ID = process.env.PAYMENT_SITE_ID;
const PAYMENT_SECRET = process.env.PAYMENT_SECRET;
const BASE_URL = process.env.PAYMENT_PROVIDER_URL || 'https://api-checkout.cinetpay.com/v2/payment';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const paymentProviderService = {
    isConfigured() {
        return !!(PAYMENT_API_KEY && PAYMENT_SITE_ID);
    },

    /**
     * Génère une URL de paiement CinetPay (Mobile Money, cartes).
     * En dev sans clés → simulation locale uniquement.
     */
    generatePaymentUrl: async (transactionId, montant, description, userPhone) => {
        if (!paymentProviderService.isConfigured()) {
            if (IS_PRODUCTION) {
                throw new Error('PAYMENT_API_KEY et PAYMENT_SITE_ID requis en production.');
            }
            console.warn('🟡 [PAYMENT] Mode simulation (clés API absentes).');
            return `${FRONTEND_URL}/payment/simulate/${transactionId}`;
        }

        const payload = {
            apikey: PAYMENT_API_KEY,
            site_id: PAYMENT_SITE_ID,
            transaction_id: transactionId,
            amount: Math.round(montant),
            currency: 'GNF',
            description: description || `Recharge BCA Connect - ${transactionId}`,
            customer_phone_number: userPhone || '',
            return_url: `${FRONTEND_URL}/wallet?status=success&tx=${transactionId}`,
            notify_url: `${BACKEND_URL}/api/payments/webhook`,
            channels: 'ALL'
        };

        const response = await axios.post(BASE_URL, payload, { timeout: 15000 });

        if (response.data?.code === '201' && response.data?.data?.payment_url) {
            return response.data.data.payment_url;
        }

        console.error('🔴 [PAYMENT API]', response.data);
        throw new Error(response.data?.message || 'Erreur lors de la génération du paiement.');
    },

    /**
     * Vérifie l'authenticité d'un webhook entrant (HMAC SHA256).
     */
    verifyWebhookSignature: (req) => {
        if (!PAYMENT_SECRET) {
            if (IS_PRODUCTION) {
                console.error('🔴 [WEBHOOK] PAYMENT_SECRET manquant en production.');
                return false;
            }
            return true;
        }

        const signature = req.headers['x-token'] || req.headers['signature'] || req.headers['x-cinetpay-signature'];
        if (!signature) return false;

        try {
            const payloadString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', PAYMENT_SECRET)
                .update(payloadString)
                .digest('hex');

            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        } catch {
            return signature === crypto
                .createHmac('sha256', PAYMENT_SECRET)
                .update(JSON.stringify(req.body))
                .digest('hex');
        }
    },

    /**
     * Vérifie le statut d'une transaction auprès de CinetPay (double-check webhook).
     */
    verifyTransactionStatus: async (transactionId) => {
        if (!paymentProviderService.isConfigured()) return null;

        try {
            const response = await axios.post(
                'https://api-checkout.cinetpay.com/v2/payment/check',
                {
                    apikey: PAYMENT_API_KEY,
                    site_id: PAYMENT_SITE_ID,
                    transaction_id: transactionId
                },
                { timeout: 15000 }
            );
            return response.data?.data?.status || null;
        } catch (error) {
            console.error('🔴 [PAYMENT CHECK]', error.message);
            return null;
        }
    }
};

module.exports = paymentProviderService;
