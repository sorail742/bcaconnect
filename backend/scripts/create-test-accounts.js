/**
 * 🛠️ BCA Connect — Script de création de comptes de test
 * Usage: node scripts/create-test-accounts.js
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User, Wallet, Store, sequelize } = require('../src/models');

const TEST_USERS = [
    {
        nom_complet: 'Admin Test',
        email: 'admin@test.com',
        telephone: '0600000001',
        mot_de_passe: 'Admin@123',
        role: 'admin',
        est_approuve: true,
        statut: 'actif',
    },
    {
        nom_complet: 'Fournisseur Test',
        email: 'fournisseur@test.com',
        telephone: '0600000002',
        mot_de_passe: 'Fournisseur@123',
        role: 'fournisseur',
        est_approuve: true,
        statut: 'actif',
        categorie_activite: 'Electronique',
        registre_commerce: 'RC-FRN-001',
        adresse: 'Quartier Commerce, Conakry',
    },
    {
        nom_complet: 'Transporteur Test',
        email: 'transporteur@test.com',
        telephone: '0600000003',
        mot_de_passe: 'Transport@123',
        role: 'transporteur',
        est_approuve: true,
        statut: 'actif',
        metadata_transporteur: {
            type_vehicule: 'camionnette',
            numero_permis: 'ABC-123-456',
            zone_couverture: 'Conakry & Banlieue',
            disponibilite: 'temps_plein',
        },
        adresse: 'Quartier Transport, Conakry',
    },
    {
        nom_complet: 'Client Test',
        email: 'client@test.com',
        telephone: '0600000004',
        mot_de_passe: 'Client@123',
        role: 'client',
        est_approuve: true,
        statut: 'actif',
        adresse: 'Quartier Résidentiel, Conakry',
    },
    {
        nom_complet: 'Banque Test',
        email: 'banque@test.com',
        telephone: '0600000005',
        mot_de_passe: 'Banque@123',
        role: 'banque',
        est_approuve: true,
        statut: 'actif',
    },
    {
        nom_complet: 'Technicien Test',
        email: 'technicien@test.com',
        telephone: '0600000006',
        mot_de_passe: 'Technicien@123',
        role: 'technicien',
        est_approuve: true,
        statut: 'actif',
        specialites: 'Électricité, Plomberie, Climatisation',
        zone_intervention: 'Conakry & Banlieue',
        adresse: 'Quartier Technique, Conakry',
    },
];

async function createTestAccounts() {
    try {
        console.log('🚀 Démarrage de la création des comptes de test...');

        for (const userData of TEST_USERS) {
            const existing = await User.findOne({ where: { email: userData.email } });
            
            if (existing) {
                console.log(`⚠️  L'utilisateur ${userData.email} (${userData.role}) existe déjà.`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.mot_de_passe, salt);
            const plainPassword = userData.mot_de_passe;

            const user = await User.create({
                ...userData,
                mot_de_passe: hashedPassword,
            });

            // Créer un portefeuille pour chaque utilisateur
            await Wallet.create({
                user_id: user.id,
                solde_virtuel: userData.role === 'client' ? 5000000 : 1000000,
                solde_sequestre: 0,
            });

            // Si c'est un fournisseur, créer une boutique par défaut
            if (userData.role === 'fournisseur') {
                await Store.create({
                    proprietaire_id: user.id,
                    nom_boutique: 'Boutique Test Tech',
                    description: 'Votre boutique de test pour l\'électronique.',
                    slug: 'boutique-test-tech-' + user.id.substring(0, 8),
                    statut: 'actif',
                    is_verified: true,
                });
                console.log(`🏠 Boutique créée pour le fournisseur : ${user.email}`);
            }

            console.log(`✅ Créé [${user.role}] : ${user.email} | mdp: ${plainPassword}`);
        }

        console.log('\n✨ Tous les comptes de test ont été traités.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la création des comptes :', error);
        process.exit(1);
    }
}

createTestAccounts();
