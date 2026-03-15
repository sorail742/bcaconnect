const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testFullCycle() {
    console.log('🏁 DÉMARRAGE DU TEST DE CYCLE COMPLET (PHASE 2)\n');

    try {
        // --- PRÉPARATION DES ACTEURS ---

        // 1. Inscription Fournisseur
        const sellerEmail = `vendeur-${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, {
            nom_complet: "Boutique Alpha",
            email: sellerEmail,
            telephone: `01${Math.floor(Math.random() * 10000000)}`,
            mot_de_passe: "pass123",
            role: "fournisseur"
        });
        const sellerLogin = await axios.post(`${API_URL}/auth/login`, { email: sellerEmail, mot_de_passe: "pass123" });
        const sellerToken = sellerLogin.data.token;
        const sellerAuth = { headers: { Authorization: `Bearer ${sellerToken}` } };
        console.log('✅ Fournisseur prêt.');

        // 2. Inscription Client
        const clientEmail = `client-${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, {
            nom_complet: "Acheteur Beta",
            email: clientEmail,
            telephone: `07${Math.floor(Math.random() * 10000000)}`,
            mot_de_passe: "pass123",
            role: "client"
        });
        const clientLogin = await axios.post(`${API_URL}/auth/login`, { email: clientEmail, mot_de_passe: "pass123" });
        const clientToken = clientLogin.data.token;
        const clientAuth = { headers: { Authorization: `Bearer ${clientToken}` } };
        console.log('✅ Client prêt.');

        // 3. Inscription Transporteur
        const carrierEmail = `transp-${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, {
            nom_complet: "Service Livraison Express",
            email: carrierEmail,
            telephone: `05${Math.floor(Math.random() * 10000000)}`,
            mot_de_passe: "pass123",
            role: "transporteur"
        });
        const carrierLogin = await axios.post(`${API_URL}/auth/login`, { email: carrierEmail, mot_de_passe: "pass123" });
        const carrierToken = carrierLogin.data.token;
        const carrierAuth = { headers: { Authorization: `Bearer ${carrierToken}` } };
        console.log('✅ Transporteur prêt.\n');

        // --- ÉTAPE 1 : CRÉATION DE LA BOUTIQUE ET DU PRODUIT ---
        console.log('🛠️  Étape 1: Mise en vente...');
        await axios.post(`${API_URL}/stores`, { nom_boutique: "Alpha Shop", description: "Boutique test" }, sellerAuth);
        const prodRes = await axios.post(`${API_URL}/products`, {
            nom_produit: "Laptop Pro",
            description: "Ordinateur puissant",
            prix_unitaire: 500000,
            stock_quantite: 5
        }, sellerAuth);
        const productId = prodRes.data.id;
        console.log(`✅ Produit "Laptop Pro" créé (ID: ${productId.slice(0, 8)})\n`);

        // --- ÉTAPE 2 : COMMANDE PAR LE CLIENT ---
        console.log('🛒 Étape 2: Le client passe commande...');
        const orderRes = await axios.post(`${API_URL}/orders`, {
            items: [{ productId: productId, quantity: 1 }]
        }, clientAuth);
        const orderId = orderRes.data.id;
        console.log(`✅ Commande confirmée (ID: ${orderId.slice(0, 8)}) - Statut: ${orderRes.data.statut}\n`);

        // --- ÉTAPE 3 : GESTION PAR LE TRANSPORTEUR ---
        console.log('🚚 Étape 3: Le transporteur prend en charge...');

        // Voir les commandes disponibles
        const availRes = await axios.get(`${API_URL}/delivery/available`, carrierAuth);
        console.log(`🔍 Commandes à livrer trouvées: ${availRes.data.length}`);

        // S'assigner la commande
        await axios.post(`${API_URL}/delivery/assign`, { orderId: orderId }, carrierAuth);
        console.log('📦 Commande ramassée par le transporteur.');

        // Marquer comme livré
        await axios.patch(`${API_URL}/delivery/status`, { orderId: orderId, status: "livre" }, carrierAuth);
        console.log('🏁 Commande marquée comme LIVRÉE !\n');

        // --- ÉTAPE 4 : INTELLIGENCE ARTIFICIELLE ---
        console.log('🤖 Étape 4: Analyse IA des résultats...');
        const aiRes = await axios.get(`${API_URL}/ai/insights`, sellerAuth);
        console.log('💡 Recommandation IA Vendeur:', aiRes.data.recommendations[0]?.insight || "Analyse en cours...");

        const trustRes = await axios.get(`${API_URL}/ai/trust-score`, clientAuth);
        console.log(`🛡️ Score de confiance Client: ${trustRes.data.score} (${trustRes.data.reliability})\n`);

        console.log('🚀 CYCLE COMPLET RÉUSSI : De la mise en vente à la livraison finale !');

    } catch (error) {
        console.error('\n❌ ERREUR DANS LE CYCLE :');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testFullCycle();
