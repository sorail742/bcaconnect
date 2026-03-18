const axios = require('axios');
const testUtils = require('./test-utils');

const API_URL = 'http://localhost:5000/api';

async function testFullCycle() {
    console.log('🏁 DÉMARRAGE DU TEST DE CYCLE COMPLET (PHASE 2-5)\n');

    try {
        // --- ÉTAPE 0 : PRÉPARATION DES ACTEURS ---
        console.log('👥 Étape 0: Préparation des acteurs...');
        const { sellerAuth, clientAuth, carrierAuth } = await testUtils.createTestActors();

        // Créditer le client pour qu'il puisse acheter
        await testUtils.creditWallet(clientAuth, 10000000); // 10M GNF

        console.log('✅ Acteurs prêts et client financé.\n');

        // --- ÉTAPE 1 : CRÉATION DE LA BOUTIQUE ET DU PRODUIT ---
        console.log('🛠️  Étape 1: Mise en vente...');
        await axios.post(`${API_URL}/stores`, {
            nom_boutique: "Alpha Shop",
            description: "Boutique test premium"
        }, sellerAuth.authHeader);

        const prodRes = await axios.post(`${API_URL}/products`, {
            nom_produit: "Laptop Pro X1",
            description: "Ordinateur ultra-puissant pour développeurs",
            prix_unitaire: 7500000,
            stock_quantite: 10
        }, sellerAuth.authHeader);
        const productId = prodRes.data.id;
        console.log(`✅ Produit créé (ID: ${productId.slice(0, 8)})\n`);

        // --- ÉTAPE 2 : COMMANDE PAR LE CLIENT ---
        console.log('🛒 Étape 2: Le client passe commande...');
        const orderRes = await axios.post(`${API_URL}/orders`, {
            items: [{ productId: productId, quantity: 1 }]
        }, clientAuth.authHeader);
        const orderId = orderRes.data.id;
        console.log(`✅ Commande confirmée (ID: ${orderId.slice(0, 8)}) - Statut: ${orderRes.data.statut}\n`);

        // --- ÉTAPE 3 : PRÉPARATION PAR LE VENDEUR ---
        console.log('📦 Étape 3: Le vendeur prépare la commande...');
        // On récupère le détail de la commande pour avoir l'ID de l'item
        const orderDetail = await axios.get(`${API_URL}/orders/${orderId}`, clientAuth.authHeader);
        const itemId = orderDetail.data.details[0].id;

        await axios.patch(`${API_URL}/orders/items/${itemId}/status`, {
            status: 'confirme'
        }, sellerAuth.authHeader);
        console.log('✅ Article confirmé par le vendeur.');

        await axios.patch(`${API_URL}/orders/items/${itemId}/status`, {
            status: 'prepare'
        }, sellerAuth.authHeader);
        console.log('✅ Article marqué comme PRÊT.\n');

        // --- ÉTAPE 4 : GESTION PAR LE TRANSPORTEUR ---
        console.log('🚚 Étape 4: Le transporteur prend en charge...');

        // Vérification disponibilité
        const availRes = await axios.get(`${API_URL}/delivery/available`, carrierAuth.authHeader);
        const targetOrder = availRes.data.find(o => o.id === orderId);

        if (!targetOrder) {
            throw new Error("La commande n'est pas apparue dans la liste 'disponible' pour le transporteur.");
        }
        console.log(`🔍 Commande ${orderId.slice(0, 8)} trouvée dans les disponibles.`);

        // Assignation
        await axios.post(`${API_URL}/delivery/assign`, { orderId: orderId }, carrierAuth.authHeader);
        console.log('✅ Commande assignée au transporteur.');

        // Status: ramasse
        await axios.patch(`${API_URL}/delivery/status`, { orderId: orderId, status: "ramasse" }, carrierAuth.authHeader);
        console.log('📦 Commande ramassée.');

        // Status: en_cours
        await axios.patch(`${API_URL}/delivery/status`, { orderId: orderId, status: "en_cours" }, carrierAuth.authHeader);
        console.log('🛣️  En cours de livraison...');

        // Status: livre
        await axios.patch(`${API_URL}/delivery/status`, { orderId: orderId, status: "livre" }, carrierAuth.authHeader);
        console.log('🏁 Commande marquée comme LIVRÉE !\n');

        // --- ÉTAPE 5 : ANALYSE & INSIGHTS ---
        console.log('🤖 Étape 5: Vérification des Insights & Scores...');
        const aiRes = await axios.get(`${API_URL}/ai/insights`, sellerAuth.authHeader);
        console.log('💡 Insights Vendeur récupérés:', aiRes.data.recommendations?.length || 0, 'recommandations.');

        const trustRes = await axios.get(`${API_URL}/ai/trust-score`, clientAuth.authHeader);
        console.log(`🛡️  Score de confiance Client: ${trustRes.data.score}/100 [${trustRes.data.reliability}]\n`);

        console.log('🚀 TEST DE CYCLE COMPLET RÉUSSI !');

    } catch (error) {
        console.error('\n❌ ERREUR LORS DU TEST :');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
            if (error.stack) console.error(error.stack);
        }
        process.exit(1);
    }
}

testFullCycle();
