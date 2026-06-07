/**
 * Test staging CinetPay — vérifie la config et le flux paiement.
 *
 * Usage:
 *   node scripts/test-cinetpay-staging.js          # simulation (sans clés)
 *   PAYMENT_MODE=live node scripts/test-cinetpay-staging.js --check-env  # valide .env
 */
require('dotenv').config();
const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5001/api';
const client = axios.create({ baseURL: API, validateStatus: () => true });

const REQUIRED_LIVE = ['PAYMENT_API_KEY', 'PAYMENT_SITE_ID', 'PAYMENT_SECRET', 'BACKEND_URL', 'FRONTEND_URL'];
let passed = 0;
let failed = 0;

const ok = (name, cond, detail = '') => {
    if (cond) { console.log(`  ✅ ${name}`); passed++; }
    else { console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`); failed++; }
};

async function login() {
    const res = await client.post('/auth/login', {
        email: 'client@test.com',
        mot_de_passe: 'Client@123',
    });
    if (res.status !== 200 || !res.data.token) throw new Error('Login client échoué — lancez npm run seed:accounts');
    return res.data.token;
}

async function run() {
    console.log('\n💳 Test staging CinetPay — BCA Connect\n');

    const isLive = process.env.PAYMENT_MODE === 'live';
    console.log(`  Mode: ${isLive ? 'LIVE (CinetPay)' : 'simulation'}\n`);

    if (process.argv.includes('--check-env') || isLive) {
        const missing = REQUIRED_LIVE.filter((k) => !process.env[k]);
        ok('Variables live présentes', missing.length === 0, missing.join(', ') || 'OK');
        ok('BACKEND_URL en HTTPS', !process.env.BACKEND_URL || process.env.BACKEND_URL.startsWith('https://'),
            process.env.BACKEND_URL || 'non défini');
        ok('FRONTEND_URL défini', !!process.env.FRONTEND_URL, process.env.FRONTEND_URL);
    }

    const token = await login();
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    const initRes = await client.post('/payments/initiate', {
        montant: 1000,
        moyen_paiement: 'mobile_money',
    }, auth);

    ok('POST /payments/initiate → 201', initRes.status === 201, `${initRes.status}`);
    const txId = initRes.data?.transaction_id;
    const paymentUrl = initRes.data?.payment_url;
    ok('transaction_id retourné', !!txId);
    ok('payment_url retourné', !!paymentUrl, paymentUrl?.slice(0, 60));

    if (paymentUrl?.includes('cinetpay.com') || paymentUrl?.includes('checkout')) {
        ok('URL CinetPay générée', true, 'redirect externe');
        console.log('\n  ℹ️  Ouvrez l\'URL dans un navigateur pour tester le paiement réel.');
        console.log(`  ℹ️  Webhook attendu sur: ${process.env.BACKEND_URL || 'BACKEND_URL'}/api/payments/webhook\n`);
    } else if (paymentUrl?.includes('/payment/simulate/')) {
        const simRes = await client.post('/payments/capture-simulation', { transaction_id: txId }, auth);
        ok('Simulation capture → 200', simRes.status === 200, simRes.data?.message);

        const statusRes = await client.get(`/payments/status/${txId}`, auth);
        ok('GET /payments/status → complete', statusRes.data?.statut === 'complete', statusRes.data?.statut);
    }

    console.log(`\n📊 Résultat : ${passed} passés, ${failed} échoués\n`);
    process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
    console.error('💥', err.message);
    process.exit(1);
});
