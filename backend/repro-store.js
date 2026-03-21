const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testStoreCreation() {
    try {
        console.log("🚀 Test de création de boutique...");

        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'testvendor@bca.com',
            mot_de_passe: 'password123'
        });
        const token = loginRes.data.token;
        console.log("✅ Authentifié !");

        // 2. Create Store
        const storeData = {
            nom_boutique: "Boutique de Test " + Date.now(),
            description: "Une super description",
            email_boutique: "contact@test.com",
            telephone_boutique: "622000000",
            logo_url: "https://example.com/logo.png"
        };

        const createRes = await axios.post(`${API_URL}/stores`, storeData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ Boutique créée:", createRes.data);

        if (!createRes.data.email_boutique) {
            console.warn("⚠️ Attention: email_boutique est manquant dans la réponse !");
        }

    } catch (error) {
        console.error("❌ Erreur:", error.response?.data || error.message);
    }
}

testStoreCreation();
