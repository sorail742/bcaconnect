/**
 * PHASE 13 - Script de tests légers pour valider les routes critiques.
 * Usage : node test-api.js (le serveur doit être démarré sur le port 5000)
 */
const http = require('http');

const BASE_URL = 'http://localhost:5000';
let passCount = 0;
let failCount = 0;

const request = (method, path, body = null) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path,
            method,
            headers: { 'Content-Type': 'application/json' },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
        });

        req.on('error', () => resolve({ status: 0, data: {} }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const test = async (name, fn) => {
    try {
        await fn();
        console.log(`  ✅ PASS: ${name}`);
        passCount++;
    } catch (e) {
        console.log(`  ❌ FAIL: ${name} — ${e.message}`);
        failCount++;
    }
};

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

const runTests = async () => {
    console.log('\n🧪 BCA Connect - Tests de Santé API (Phase 13)\n');

    // Test 1 : Santé du serveur
    await test('GET /health retourne HTTP 200', async () => {
        const r = await request('GET', '/health');
        assert(r.status === 200, `Attendu 200, reçu ${r.status}`);
        assert(r.data.status === 'ok', 'Statut non "ok"');
    });

    // Test 2 : Validation inscription - champs manquants
    await test('POST /api/auth/register bloque les données invalides', async () => {
        const r = await request('POST', '/api/auth/register', { email: 'invalid' });
        assert(r.status === 422, `Attendu 422, reçu ${r.status}`);
    });

    // Test 3 : Route inexistante doit retourner 404
    await test('Route inexistante retourne HTTP 404', async () => {
        const r = await request('GET', '/api/inexistant');
        assert(r.status === 404, `Attendu 404, reçu ${r.status}`);
    });

    // Test 4 : Simulation de crédit (sans auth)
    await test('POST /api/credits/simulate fonctionne sans token', async () => {
        const r = await request('POST', '/api/credits/simulate', { montant: 500000, duree_mois: 6, taux: 5 });
        assert(r.status === 200, `Attendu 200, reçu ${r.status}`);
    });

    // Test 5 : Route protégée sans token
    await test('GET /api/wallet/me bloque sans token (401)', async () => {
        const r = await request('GET', '/api/wallet/me');
        assert(r.status === 401, `Attendu 401, reçu ${r.status}`);
    });

    console.log(`\n📊 Résultats : ${passCount} réussis / ${failCount} échoués\n`);
};

runTests();
