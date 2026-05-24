const axios = require('axios');
const { User, Order, OrderItem, Wallet, Product, Boutique, sequelize } = require('./src/models');
const tokenService = require('./src/services/tokenService');

const API_URL = 'http://localhost:5000/api';

async function getTokensByRole(role) {
    const user = await User.findOne({ where: { role } });
    if (!user) throw new Error(`Aucun utilisateur trouvé pour le rôle ${role}`);
    const tokens = await tokenService.getTokens(user);
    return { token: tokens.accessToken, id: user.id, user };
}

async function run() {
    console.log("=== Début de l'Audit Fonctionnel (Logistique & Transporteur) ===");
    try {
        await sequelize.authenticate();
        
        // 1. Authentification
        console.log("1. Authentification des utilisateurs de test...");
        const client = await getTokensByRole('client');
        const vendor = await getTokensByRole('fournisseur');
        const carrier = await getTokensByRole('transporteur');

        console.log(`✅ Client ID: ${client.id}`);
        console.log(`✅ Vendeur ID: ${vendor.id}`);
        console.log(`✅ Transporteur ID: ${carrier.id}`);

        // Vérifier/Créer portefeuille pour le vendeur (pour l'Escrow)
        let vendorWallet = await Wallet.findOne({ where: { user_id: vendor.id } });
        if (!vendorWallet) {
            vendorWallet = await Wallet.create({ user_id: vendor.id, solde_virtuel: 0, solde_sequestre: 0 });
        }
        
        // 2. Création d'une commande 'pret'
        console.log("2. Création d'une commande prête à être expédiée...");
        const testOrder = await Order.create({
            utilisateur_id: client.id,
            total_ttc: 50000,
            frais_port: 5000,
            statut: 'payé',
            statut_livraison: 'pret',
            adresse_livraison: 'Conakry',
            methode_paiement: 'wallet'
        });

        const testItem = await OrderItem.create({
            commande_id: testOrder.id,
            produit_id: null, // On s'en fiche pour le test
            fournisseur_id: vendor.id,
            quantite: 1,
            prix_unitaire_achat: 45000,
            statut: 'prepare'
        });

        // Simuler le placement en séquestre
        vendorWallet.solde_sequestre = parseFloat(vendorWallet.solde_sequestre) + 45000;
        await vendorWallet.save();
        const initialEscrow = vendorWallet.solde_sequestre;
        const initialVirtuel = vendorWallet.solde_virtuel;
        
        console.log(`✅ Commande test créée (ID: ${testOrder.id})`);
        console.log(`💰 Solde Séquestre initial du vendeur: ${initialEscrow}`);

        // 3. Assigner la course au transporteur
        console.log("3. Transporteur accepte la mission...");
        const resAssign = await axios.post(`${API_URL}/delivery/assign`, {
            orderId: testOrder.id
        }, {
            headers: { Authorization: `Bearer ${carrier.token}` }
        });

        const { order_otp } = resAssign.data;
        console.log(`✅ Mission acceptée ! OTP de livraison généré : ${order_otp}`);

        // 4. Update tracking
        console.log("4. Transporteur met à jour la position...");
        await axios.post(`${API_URL}/delivery/tracking`, {
            orderId: testOrder.id,
            status: 'en_route',
            latitude: 9.509167,
            longitude: -13.712222,
            commentaire: "Je suis en chemin"
        }, {
            headers: { Authorization: `Bearer ${carrier.token}` }
        });
        console.log(`✅ Position mise à jour (en_route).`);

        // 5. Finaliser avec OTP
        console.log("5. Transporteur finalise la livraison avec OTP...");
        const resVerify = await axios.post(`${API_URL}/delivery/verify`, {
            orderId: testOrder.id,
            otp: order_otp
        }, {
            headers: { Authorization: `Bearer ${carrier.token}` }
        });
        console.log(`✅ Livraison validée : ${resVerify.data.message}`);

        // 6. Vérifier les soldes du vendeur
        console.log("6. Vérification financière du séquestre...");
        await vendorWallet.reload();
        
        console.log(`💰 Solde Séquestre final: ${vendorWallet.solde_sequestre} (attendu: ${initialEscrow - 45000})`);
        console.log(`💰 Solde Virtuel final: ${vendorWallet.solde_virtuel} (attendu: ${initialVirtuel + 45000})`);

        if (parseFloat(vendorWallet.solde_sequestre) === parseFloat(initialEscrow) - 45000) {
            console.log("✅ SUCCÈS : Les fonds ont été correctement libérés du séquestre !");
        } else {
            console.error("❌ ERREUR : Le séquestre n'a pas été débloqué correctement !");
        }

        console.log("=== Audit Fonctionnel Terminé avec Succès ===");
        process.exit(0);

    } catch (error) {
        console.error("❌ ERREUR LORS DU TEST:", error?.response?.data || error.message);
        process.exit(1);
    }
}

run();
