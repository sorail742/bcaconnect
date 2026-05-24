const axios = require('axios');
const { User, Order, sequelize } = require('./src/models');
const tokenService = require('./src/services/tokenService');

const API_URL = 'http://localhost:5000/api';

async function getTokens(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error(`User ${email} not found`);
    const tokens = await tokenService.getTokens(user);
    return { token: tokens.accessToken, id: user.id };
}

async function run() {
    console.log("=== Début de l'Audit Fonctionnel (Litiges & Notifications) ===");
    try {
        await sequelize.authenticate();
        
        // 1. Authentification
        console.log("1. Authentification des utilisateurs de test (via tokenService)...");
        
        const client = await getTokens('client@bca.com');
        const vendor = await getTokens('vendeur@bca.com');
        const admin = await getTokens('admin@bca.com');

        console.log("✅ Tokens générés avec succès.");

        // 2. Création d'une commande bidon directement via la BDD pour le test
        console.log("2. Création d'une commande de test...");
        
        const testOrder = await Order.create({
            utilisateur_id: client.id,
            total_ttc: 50000,
            statut: 'livré',
            adresse_livraison: 'Conakry',
            methode_paiement: 'wallet',
            transaction_id: 'TEST_TX_' + Date.now(),
            frais_livraison: 5000
        });
        
        console.log(`✅ Commande test créée (ID: ${testOrder.id})`);

        // 3. Ouverture du litige par le client
        console.log("3. Simulation d'ouverture de litige (Client)...");
        const resDispute = await axios.post(`${API_URL}/disputes`, {
            commande_id: testOrder.id,
            type: 'qualite',
            description: 'Le produit reçu est endommagé sur le côté droit.',
            defenseur_id: vendor.id
        }, {
            headers: { Authorization: `Bearer ${client.token}` }
        });

        const litige = resDispute.data;
        console.log(`✅ Litige ouvert (ID: ${litige.id})`);
        console.log(`🧠 Médiation IA : ${litige.solution_proposee_ia} (Gravité: ${litige.ia_score_gravite})`);

        // Attendre un peu que le socket émette et insère la notif
        await new Promise(r => setTimeout(r, 1000));

        // 4. Vérification des notifications (Vendeur)
        console.log("4. Vérification des notifications reçues par le Vendeur...");
        const resNotifVendor = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${vendor.token}` }
        });
        const hasDisputeNotif = resNotifVendor.data.some(n => n.type === 'dispute' && n.titre === 'Nouveau litige ouvert');
        if (hasDisputeNotif) {
            console.log("✅ Notification 'Nouveau litige ouvert' bien reçue par le vendeur.");
        } else {
            console.error("❌ Notification manquante pour le vendeur !");
        }

        // 5. Résolution du litige par l'Admin
        console.log("5. Résolution du litige par l'Administration...");
        const resResolve = await axios.put(`${API_URL}/disputes/${litige.id}/resolve`, {
            statut: 'resolu',
            decision_finale: "Remboursement accordé au client suite à la vérification des photos."
        }, {
            headers: { Authorization: `Bearer ${admin.token}` }
        });
        console.log(`✅ Litige résolu avec statut: ${resResolve.data.statut}`);

        await new Promise(r => setTimeout(r, 1000));

        // 6. Vérification des notifications de clôture
        console.log("6. Vérification des notifications de clôture...");
        const resNotifClient = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${client.token}` }
        });
        const hasClientResolvedNotif = resNotifClient.data.some(n => n.type === 'dispute' && n.titre === 'Litige résolu');
        if (hasClientResolvedNotif) {
            console.log("✅ Notification 'Litige résolu' bien reçue par le client.");
        } else {
            console.error("❌ Notification manquante pour le client !");
        }

        const resNotifVendorAfter = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${vendor.token}` }
        });
        const hasVendorResolvedNotif = resNotifVendorAfter.data.some(n => n.type === 'dispute' && n.titre === 'Litige résolu');
        if (hasVendorResolvedNotif) {
            console.log("✅ Notification 'Litige résolu' bien reçue par le vendeur.");
        } else {
            console.error("❌ Notification manquante pour le vendeur (résolution) !");
        }

        console.log("=== Audit Fonctionnel Terminé avec Succès ===");
        process.exit(0);

    } catch (error) {
        console.error("❌ ERREUR LORS DU TEST:", error?.response?.data || error.message);
        process.exit(1);
    }
}

run();
