// Ce fichier teste spécifiquement la logique CinetPay : il faut forcer le
// provider AVANT le require, car PAYMENT_PROVIDER est figé au chargement du
// module (sinon .env peut charger PAYMENT_PROVIDER=lengopay et faire prendre
// systématiquement l'autre branche de code, non testée ici).
process.env.PAYMENT_PROVIDER = 'cinetpay';
const crypto = require('crypto');
const paymentProviderService = require('../src/services/paymentProviderService');

describe('CinetPay webhook HMAC', () => {
    const secret = 'test-secret-key';

    const buildToken = (body) => {
        const data = paymentProviderService.buildCinetPayHmacPayload(body);
        return crypto.createHmac('sha256', secret).update(data).digest('hex');
    };

    it('valide un token x-token conforme à la spec CinetPay', () => {
        const originalSecret = process.env.PAYMENT_SECRET;
        process.env.PAYMENT_SECRET = secret;

        const body = {
            cpm_site_id: '123456',
            cpm_trans_id: 'tx-uuid-001',
            cpm_trans_date: '2026-06-06 12:00:00',
            cpm_amount: '10000',
            cpm_currency: 'GNF',
            signature: 'sig-from-cinetpay',
            payment_method: 'OMGN',
            cel_phone_num: '620000000',
            cpm_phone_prefixe: '224',
            cpm_language: 'fr',
            cpm_version: 'V4',
            cpm_payment_config: 'Single',
            cpm_page_action: 'Payment',
            cpm_custom: '',
            cpm_designation: 'Recharge BCA',
            cpm_error_message: 'SUCCES',
        };

        const token = buildToken(body);
        const req = { headers: { 'x-token': token }, body };

        expect(paymentProviderService.verifyWebhookSignature(req)).toBe(true);

        process.env.PAYMENT_SECRET = originalSecret;
    });

    it('rejette un token invalide', () => {
        const originalSecret = process.env.PAYMENT_SECRET;
        process.env.PAYMENT_SECRET = secret;

        const req = {
            headers: { 'x-token': 'invalid-token' },
            body: { cpm_trans_id: 'tx-1', cpm_site_id: '1' },
        };

        expect(paymentProviderService.verifyWebhookSignature(req)).toBe(false);

        process.env.PAYMENT_SECRET = originalSecret;
    });

    it('parse le statut succès cpm_result=00', () => {
        const parsed = paymentProviderService.parseWebhookStatus({
            cpm_trans_id: 'abc',
            cpm_result: '00',
        });
        expect(parsed.transactionId).toBe('abc');
        expect(parsed.success).toBe(true);
    });
});

describe('Sélection du canal CinetPay (isolation paiement carte — 1.11)', () => {
    const { resolveCinetPayChannels } = paymentProviderService;

    it('route "carte_bancaire" (valeur envoyée par le checkout frontend) vers CREDIT_CARD', () => {
        expect(resolveCinetPayChannels('carte_bancaire')).toBe('CREDIT_CARD');
    });

    it.each(['card', 'carte', 'credit_card', 'CARTE_BANCAIRE'])(
        'route "%s" vers CREDIT_CARD',
        (value) => {
            expect(resolveCinetPayChannels(value)).toBe('CREDIT_CARD');
        },
    );

    it('route "mobile_money" vers MOBILE_MONEY', () => {
        expect(resolveCinetPayChannels('mobile_money')).toBe('MOBILE_MONEY');
    });

    it.each([undefined, null, '', 'wallet', 'cod', 'virement'])(
        'retombe sur ALL pour un moyen non dédié à un canal ("%s")',
        (value) => {
            expect(resolveCinetPayChannels(value)).toBe('ALL');
        },
    );
});
