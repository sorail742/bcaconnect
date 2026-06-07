/**
 * Test E2E du module achats groupés
 * Usage: node scripts/test-group-purchases.js
 */
require('dotenv').config();
const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5001/api';
const client = axios.create({ baseURL: API, validateStatus: () => true });

const accounts = {
    client: { email: 'client@test.com', password: 'Client@123' },
    fournisseur: { email: 'fournisseur@test.com', password: 'Fournisseur@123' },
    admin: { email: 'admin@test.com', password: 'Admin@123' },
};

let passed = 0;
let failed = 0;

const assert = (name, condition, detail = '') => {
    if (condition) {
        console.log(`  ✅ ${name}`);
        passed++;
    } else {
        console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
        failed++;
    }
};

async function login(role) {
    const { email, password } = accounts[role];
    const res = await client.post('/auth/login', { email, mot_de_passe: password });
    if (res.status !== 200 || !res.data.token) {
        throw new Error(`Login ${role} failed: ${res.status} ${JSON.stringify(res.data)}`);
    }
    return res.data.token;
}

async function run() {
    console.log('\n🧪 Test achats groupés — BCA Connect\n');
    console.log(`  API: ${API}\n`);

    // 0. Login fournisseur + vérif solde wallet
    const fournisseurToken = await login('fournisseur');
    const walletRes = await client.get('/wallet/me', {
        headers: { Authorization: `Bearer ${fournisseurToken}` },
    });
    const solde = parseFloat(walletRes.data?.solde_virtuel || 0);
    assert('Wallet fournisseur accessible', walletRes.status === 200);
    if (solde < 500000) {
        console.log(`  ⚠️  Solde fournisseur faible (${solde} GNF) — lancez: npm run seed:recharge-wallets`);
    }
    assert('Solde fournisseur suffisant (≥ 500k)', solde >= 500000, `${solde} GNF`);

    assert('Login fournisseur', !!fournisseurToken);

    // 2. Liste campagnes actives
    const listRes = await client.get('/group-purchases', {
        headers: { Authorization: `Bearer ${fournisseurToken}` },
    });
    assert('GET /group-purchases → 200', listRes.status === 200, `status ${listRes.status}`);
    assert('Au moins 1 campagne seed', Array.isArray(listRes.data) && listRes.data.length >= 1, `count ${listRes.data?.length}`);

    const campaign = listRes.data.find((c) => c.statut === 'ouvert') || listRes.data[0];
    assert('Campagne avec produit', !!campaign?.produit?.nom_produit, campaign?.titre);
    assert('Campagne avec organisateur', !!campaign?.organisateur?.nom_complet);

    console.log(`\n  📋 Campagne testée : "${campaign.titre}" (${campaign.quantite_actuelle}/${campaign.quantite_cible})`);

    // 3. Détail campagne
    const detailRes = await client.get(`/group-purchases/${campaign.id}`, {
        headers: { Authorization: `Bearer ${fournisseurToken}` },
    });
    assert('GET /group-purchases/:id → 200', detailRes.status === 200);

    // 4. Rejoindre la campagne (fournisseur) — leave d'abord si déjà participant (idempotent)
    const alreadyJoined = await client.get('/group-purchases?mine=joined', {
        headers: { Authorization: `Bearer ${fournisseurToken}` },
    });
    if (alreadyJoined.data?.some((c) => c.id === campaign.id)) {
        await client.delete(`/group-purchases/${campaign.id}/leave`, {
            headers: { Authorization: `Bearer ${fournisseurToken}` },
        });
        const refreshed = await client.get('/group-purchases', {
            headers: { Authorization: `Bearer ${fournisseurToken}` },
        });
        const updated = refreshed.data.find((c) => c.id === campaign.id);
        if (updated) campaign.quantite_actuelle = updated.quantite_actuelle;
    }

    const joinRes = await client.post(
        `/group-purchases/${campaign.id}/join`,
        { quantite: 2 },
        { headers: { Authorization: `Bearer ${fournisseurToken}` } },
    );
    assert('POST join → 201', joinRes.status === 201, `${joinRes.status} ${joinRes.data?.message}`);
    const qtyAfterJoin = joinRes.data?.campaign?.quantite_actuelle;
    assert('Quantité incrémentée après join', qtyAfterJoin > campaign.quantite_actuelle, `${campaign.quantite_actuelle} → ${qtyAfterJoin}`);

    // 5. Double join bloqué
    const doubleJoin = await client.post(
        `/group-purchases/${campaign.id}/join`,
        { quantite: 1 },
        { headers: { Authorization: `Bearer ${fournisseurToken}` } },
    );
    assert('Double join rejeté', doubleJoin.status === 400);

    // 6. Mes participations
    const joinedRes = await client.get('/group-purchases?mine=joined', {
        headers: { Authorization: `Bearer ${fournisseurToken}` },
    });
    assert('GET mine=joined → 200', joinedRes.status === 200);
    assert('Participation visible', joinedRes.data.some((c) => c.id === campaign.id));

    // 7. Quitter la campagne
    const leaveRes = await client.delete(`/group-purchases/${campaign.id}/leave`, {
        headers: { Authorization: `Bearer ${fournisseurToken}` },
    });
    assert('DELETE leave → 200', leaveRes.status === 200, leaveRes.data?.message);

    // 8. Re-rejoindre pour test clôture
    const rejoinRes = await client.post(
        `/group-purchases/${campaign.id}/join`,
        { quantite: 3 },
        { headers: { Authorization: `Bearer ${fournisseurToken}` } },
    );
    assert('Re-join après leave → 201', rejoinRes.status === 201);

    // 9. Login client (organisateur) — mes campagnes
    const clientToken = await login('client');
    const organizedRes = await client.get('/group-purchases?mine=organized', {
        headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert('GET mine=organized (client) → 200', organizedRes.status === 200);
    assert('Client a des campagnes organisées', organizedRes.data.length >= 1);

    // 10. Clôturer campagne avec participant (fournisseur a rejoint "Pompes à eau")
    const closeRes = await client.post(`/group-purchases/${campaign.id}/close`, null, {
        headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert('POST close avec participant → 200', closeRes.status === 200, `${closeRes.status} ${closeRes.data?.message}`);
    assert('Commandes générées à la clôture', Array.isArray(closeRes.data?.orders) && closeRes.data.orders.length >= 1, `orders: ${closeRes.data?.orders?.length}`);

    // 11. Création campagne (client)
    const productsRes = await client.get('/products?limit=5', {
        headers: { Authorization: `Bearer ${clientToken}` },
    });
    const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.products || [];
    if (products.length > 0) {
        const dateLimite = new Date();
        dateLimite.setDate(dateLimite.getDate() + 30);
        const createRes = await client.post('/group-purchases', {
            produit_id: products[0].id,
            titre: `Test auto — ${Date.now()}`,
            description: 'Campagne créée par script de test',
            quantite_cible: 5,
            remise_pct: 10,
            date_limite: dateLimite.toISOString(),
            zone_livraison: 'Conakry',
            type_organisateur: 'ong',
        }, { headers: { Authorization: `Bearer ${clientToken}` } });
        assert('POST create campagne → 201', createRes.status === 201, `${createRes.status} ${createRes.data?.message}`);
        assert('Prix groupe calculé', createRes.data?.campaign?.prix_unitaire_groupe < createRes.data?.campaign?.prix_unitaire_normal);
    }

    // 12. Organisateur ne peut pas rejoindre sa campagne
    if (organizedRes.data[0]) {
        const ownJoin = await client.post(
            `/group-purchases/${organizedRes.data[0].id}/join`,
            { quantite: 1 },
            { headers: { Authorization: `Bearer ${clientToken}` } },
        );
        assert('Organisateur bloqué sur join', ownJoin.status === 400);
    }

    console.log(`\n📊 Résultat : ${passed} passés, ${failed} échoués\n`);
    process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
    console.error('❌ Erreur fatale:', err.message);
    process.exit(1);
});
