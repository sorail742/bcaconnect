const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// 'cinetpay' (défaut) ou 'lengopay'
const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || 'cinetpay').toLowerCase();

const PAYMENT_API_KEY = process.env.PAYMENT_API_KEY;
const PAYMENT_SITE_ID = process.env.PAYMENT_SITE_ID;
const PAYMENT_SECRET = process.env.PAYMENT_SECRET;
const BASE_URL = process.env.PAYMENT_PROVIDER_URL || 'https://api-checkout.cinetpay.com/v2/payment';

const LENGOPAY_LICENSE_KEY = process.env.LENGOPAY_LICENSE_KEY;
const LENGOPAY_WEBSITE_ID = process.env.LENGOPAY_WEBSITE_ID;
const LENGOPAY_BASE_URL = process.env.LENGOPAY_BASE_URL || 'https://sandbox.lengopay.com';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const PAYMENT_MODE = process.env.PAYMENT_MODE || 'simulation';

const CINETPAY_HMAC_FIELDS = [
    'cpm_site_id',
    'cpm_trans_id',
    'cpm_trans_date',
    'cpm_amount',
    'cpm_currency',
    'signature',
    'payment_method',
    'cel_phone_num',
    'cpm_phone_prefixe',
    'cpm_language',
    'cpm_version',
    'cpm_payment_config',
    'cpm_page_action',
    'cpm_custom',
    'cpm_designation',
    'cpm_error_message',
];

const paymentProviderService = {
    isConfigured() {
        if (PAYMENT_PROVIDER === 'lengopay') {
            return !!(LENGOPAY_LICENSE_KEY && LENGOPAY_WEBSITE_ID);
        }
        return !!(PAYMENT_API_KEY && PAYMENT_SITE_ID);
    },

    isLiveMode() {
        return PAYMENT_MODE === 'live' && this.isConfigured();
    },

    providerName() {
        return PAYMENT_PROVIDER;
    },

    /**
     * true si le webhook de ce provider n'est PAS authentifiable (pas de signature
     * vérifiable côté serveur) — dans ce cas le contrôleur doit EXIGER une confirmation
     * positive de verifyTransactionStatus avant de finaliser un paiement, plutôt que de
     * faire confiance au seul contenu du webhook (qui pourrait être forgé par un tiers).
     */
    requiresStatusConfirmation() {
        return PAYMENT_PROVIDER === 'lengopay';
    },

    buildCinetPayHmacPayload(body = {}) {
        return CINETPAY_HMAC_FIELDS.map((field) => String(body[field] ?? '')).join('');
    },

    /**
     * Génère une URL de paiement CinetPay (Mobile Money, cartes).
     * Sans clés → simulation locale (sauf PAYMENT_MODE=live en prod/staging).
     */
    generatePaymentUrl: async (transactionId, montant, description, userPhone, options = {}) => {
        if (!paymentProviderService.isConfigured()) {
            if (PAYMENT_MODE === 'live') {
                throw new Error(`Identifiants ${PAYMENT_PROVIDER} requis en mode live.`);
            }
            console.warn('🟡 [PAYMENT] Mode simulation (clés API absentes).');
            return `${FRONTEND_URL}/payment/simulate/${transactionId}`;
        }

        const returnPath = options.returnPath || `/payment/return?tx=${transactionId}`;

        if (PAYMENT_PROVIDER === 'lengopay') {
            return paymentProviderService._generateLengoPayUrl(transactionId, montant, returnPath, options);
        }

        const payload = {
            apikey: PAYMENT_API_KEY,
            site_id: PAYMENT_SITE_ID,
            transaction_id: transactionId,
            amount: Math.round(montant),
            currency: 'GNF',
            description: description || `Recharge BCA Connect - ${transactionId}`,
            customer_phone_number: userPhone || '',
            return_url: `${FRONTEND_URL}${returnPath}`,
            notify_url: `${BACKEND_URL}/api/payments/webhook`,
            channels: 'ALL',
            metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
        };

        const response = await axios.post(BASE_URL, payload, { timeout: 15000 });

        if (response.data?.code === '201' && response.data?.data?.payment_url) {
            return response.data.data.payment_url;
        }

        console.error('🔴 [PAYMENT API]', response.data);
        throw new Error(response.data?.message || 'Erreur lors de la génération du paiement.');
    },

    /**
     * Adaptateur LengoPay (API v1 — "Collect payments / Cash in").
     * Champs confirmés via la documentation officielle (dashboard sandbox, section
     * Accès développeur) et vérifiés par un appel réel au sandbox.
     * On passe systématiquement notre propre `transactionId` en paramètre de requête
     * sur callback_url (LengoPay ne renvoie que `pay_id` au callback, pas notre ID).
     */
    _generateLengoPayUrl: async (transactionId, montant, returnPath, options = {}) => {
        const payload = {
            websiteid: LENGOPAY_WEBSITE_ID,
            amount: Math.round(montant),
            currency: 'GNF',
            return_url: `${FRONTEND_URL}${returnPath}`,
            callback_url: `${BACKEND_URL}/api/payments/webhook?tx=${transactionId}`,
        };

        const response = await axios.post(`${LENGOPAY_BASE_URL}/api/v1/payments`, payload, {
            timeout: 15000,
            headers: {
                Authorization: `Basic ${LENGOPAY_LICENSE_KEY}`,
                Accept: 'application/json',
            },
        });

        const { payment_url: paymentUrl, pay_id: payId, status } = response.data || {};

        if (status !== 'Success' || !paymentUrl) {
            console.error('🔴 [LENGOPAY API]', response.data);
            throw new Error(response.data?.message || 'Erreur LengoPay lors de la génération du paiement.');
        }

        if (payId && typeof options.onProviderRef === 'function') {
            await options.onProviderRef(payId);
        }

        return paymentUrl;
    },

    /**
     * Vérifie l'authenticité d'un webhook CinetPay (HMAC SHA256 — header x-token).
     * @see https://docs.cinetpay.com/api/1.0-fr/checkout/hmac
     */
    verifyWebhookSignature: (req) => {
        if (PAYMENT_PROVIDER === 'lengopay') {
            // Schéma de signature LengoPay non confirmé publiquement (docs non
            // accessibles). Le webhook ne fait que déclencher `verifyTransactionStatus`,
            // qui est la source de vérité réelle (appel serveur-à-serveur authentifié
            // avec notre propre clé) avant de finaliser quoi que ce soit — voir
            // paymentController.handleWebhook. On ne bloque donc pas ici.
            return true;
        }

        const receivedToken = req.headers['x-token'];
        const body = req.body || {};
        const paymentSecret = process.env.PAYMENT_SECRET || PAYMENT_SECRET;
        const paymentMode = process.env.PAYMENT_MODE || PAYMENT_MODE;

        if (!paymentSecret) {
            if (paymentMode === 'live') {
                console.error('🔴 [WEBHOOK] PAYMENT_SECRET manquant en mode live.');
                return false;
            }
            // Dev simulation uniquement avec jeton explicite
            return receivedToken === 'dev-simulation';
        }

        if (!receivedToken) return false;

        try {
            const data = paymentProviderService.buildCinetPayHmacPayload(body);
            const expectedToken = crypto
                .createHmac('sha256', paymentSecret)
                .update(data)
                .digest('hex');

            const received = Buffer.from(String(receivedToken), 'utf8');
            const expected = Buffer.from(expectedToken, 'utf8');
            if (received.length !== expected.length) return false;
            return crypto.timingSafeEqual(received, expected);
        } catch (error) {
            console.error('🔴 [WEBHOOK HMAC]', error.message);
            return false;
        }
    },

    parseWebhookStatus(body = {}, query = {}) {
        if (PAYMENT_PROVIDER === 'lengopay') {
            // Confirmé par la doc officielle : le corps du callback ne contient que
            // { pay_id, status, amount, message, Client } — pas notre transactionId.
            // On le récupère donc via le paramètre `tx` qu'on a nous-mêmes ajouté à
            // callback_url (voir _generateLengoPayUrl).
            const transactionId = query.tx;
            const status = String(body.status || '').toUpperCase();
            const success = status === 'SUCCESS' || status === 'SUCCESSFUL';
            return { transactionId, success, raw: body };
        }

        const transactionId = body.cpm_trans_id || body.transaction_id || query.tx;
        const cpmResult = body.cpm_result;
        const explicitStatus = body.status;

        let success = false;
        if (cpmResult === '00') success = true;
        if (explicitStatus === 'success' || explicitStatus === 'ACCEPTED') success = true;
        if (body.cpm_error_message === 'SUCCES' || body.cpm_error_message === 'SUCCESS') success = true;

        return { transactionId, success, raw: body };
    },

    /**
     * Vérifie le statut d'une transaction auprès de CinetPay (double-check webhook).
     */
    verifyTransactionStatus: async (transactionId) => {
        if (!paymentProviderService.isConfigured()) return null;

        if (PAYMENT_PROVIDER === 'lengopay') {
            try {
                // Endpoint + champs vérifiés par un appel réel (paiement sandbox complété
                // avec un compte test Orange Money) : réponse confirmée
                // { status: "SUCCESS", pay_id, date, amount }. `pay_id` = celui renvoyé par
                // /api/v1/payments à la création (format base64), stocké sur la transaction.
                const { Transaction } = require('../models');
                const transaction = await Transaction.findByPk(transactionId);
                const payId = transaction?.metadata?.provider_ref;
                if (!payId) return null;

                const response = await axios.post(
                    `${LENGOPAY_BASE_URL}/api/v1/transaction/status`,
                    { websiteid: LENGOPAY_WEBSITE_ID, pay_id: payId },
                    { timeout: 15000, headers: { Authorization: `Basic ${LENGOPAY_LICENSE_KEY}` } },
                );
                const status = response.data?.status || response.data?.data?.status;
                return status ? String(status).toUpperCase() : null;
            } catch (error) {
                console.error('🔴 [LENGOPAY CHECK]', error.message);
                return null;
            }
        }

        try {
            const response = await axios.post(
                'https://api-checkout.cinetpay.com/v2/payment/check',
                {
                    apikey: PAYMENT_API_KEY,
                    site_id: PAYMENT_SITE_ID,
                    transaction_id: transactionId,
                },
                { timeout: 15000 },
            );
            return response.data?.data?.status || null;
        } catch (error) {
            console.error('🔴 [PAYMENT CHECK]', error.message);
            return null;
        }
    },
};

module.exports = paymentProviderService;
