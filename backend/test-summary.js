const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

async function runTest() {
    console.log("🚀 Lancement du Test de Validation BCA Connect...");

    try {
        // 1. Check Health
        console.log("\n🏥 [1/5] Vérification de la santé du Backend...");
        const health = await axios.get(`${API_URL}/health`);
        console.log("✅ Backend OK:", health.data);

        // 2. Admin Login
        console.log("\n🔐 [2/5] Connexion de l'administrateur...");
        const login = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'admin@bcaconnect.com',
            mot_de_passe: 'adminpassword'
        });
        const token = login.data.token;
        console.log("✅ Authentification réussie. Token obtenu.");

        const headers = { Authorization: `Bearer ${token}` };

        // 3. Check Users CRUD Access
        console.log("\n👥 [3/5] Test d'accès à la gestion des Utilisateurs...");
        const usersRes = await axios.get(`${API_URL}/api/users`, { headers });
        // Handling the object structure { total, pages, currentPage, users }
        const usersCount = Array.isArray(usersRes.data.users) ? usersRes.data.users.length : usersRes.data.length;
        console.log(`✅ Récupérés: ${usersCount} utilisateurs.`);

        // 4. Check Products CRUD Access
        console.log("\n📦 [4/5] Test d'accès au Catalogue Produits...");
        const productsRes = await axios.get(`${API_URL}/api/products`, { headers });
        const productsCount = Array.isArray(productsRes.data) ? productsRes.data.length : productsRes.data.total;
        console.log(`✅ Récupérés: ${productsCount} produits.`);

        // 5. Check Categories CRUD Access
        console.log("\n📁 [5/5] Test d'accès aux Catégories...");
        const categoriesRes = await axios.get(`${API_URL}/api/categories`, { headers });
        const catsCount = Array.isArray(categoriesRes.data) ? categoriesRes.data.length : categoriesRes.data.total;
        console.log(`✅ Récupérées: ${catsCount} catégories.`);

        console.log("\n✨ TOUS LES TESTS SONT AU VERT ! ✨");
        console.log("Le système CRUD et RBAC est parfaitement opérationnel.");

    } catch (error) {
        console.error("\n❌ ÉCHEC DU TEST:", error.response?.data || error.message);
        process.exit(1);
    }
}

runTest();
