const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testPayment() {
    console.log('🧪 Test du module de Paiement...\n');

    try {
        // 1. Connexion (on utilise un email généré ou existant)
        // Pour simplifier on crée un nouveau client
        const email = `pay-test-${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, {
            nom_complet: "Acheteur Test",
            email: email,
            telephone: `050505${Math.floor(Math.random() * 10000)}`,
            mot_de_passe: "password123",
            role: "client"
        });

        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            mot_de_passe: "password123"
        });
        const token = loginRes.data.token;
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Initier un dépôt
        console.log('1. Initiation d\'un dépôt de 10.000 FCFA...');
        const initRes = await axios.post(`${API_URL}/payments/initiate`, {
            montant: 10000,
            moyen_paiement: "wave"
        }, authHeader);

        const transactionId = initRes.data.transaction_id;
        console.log(`✅ Transaction créée: ${transactionId}`);
        console.log(`🔗 URL de paiement simulée: ${initRes.data.payment_url}\n`);

        // 3. Simulation du Webhook (Confirmation du paiement)
        console.log('2. Simulation du Webhook de succès...');
        const webhookRes = await axios.post(`${API_URL}/payments/webhook`, {
            transaction_id: transactionId,
            status: "success"
        });
        console.log(`✅ Réponse Webhook: ${webhookRes.data.message}\n`);

        // 4. Vérification du solde final
        console.log('3. Vérification du solde du portefeuille...');
        const meRes = await axios.get(`${API_URL}/auth/me`, authHeader);
        console.log(`💰 Nouveau solde: ${meRes.data.portefeuille.solde_virtuel} FCFA`);

        if (parseFloat(meRes.data.portefeuille.solde_virtuel) === 10000) {
            console.log('\n🚀 TEST DE PAIEMENT RÉUSSI !');
        } else {
            console.error('\n❌ ERREUR: Le solde ne correspond pas.');
        }

    } catch (error) {
        console.error('❌ Erreur lors du test de paiement :');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testPayment();
