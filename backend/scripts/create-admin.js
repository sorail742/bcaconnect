/**
 * Script de création d'un compte administrateur en mode local.
 * Usage : node scripts/create-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialisation de Sequelize
const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

// Chargement du modèle User (sans les associations)
const User = require('../src/models/User');

const ADMIN_CONFIG = {
    nom_complet: 'Administrateur BCA',
    email: 'admin@bca.gn',
    telephone: '+224600000000',
    mot_de_passe: 'admin123!',
    role: 'admin',
    statut: 'actif',
    est_approuve: true,
    score_confiance: 100
};

async function createAdmin() {
    try {
        console.log('\n🔧 BCA CONNECT — Création du compte Admin\n');
        
        await sequelize.authenticate();
        console.log('✅ Connexion base de données établie');
        
        // Sync sans alter pour juste vérifier la table
        await sequelize.sync();
        console.log('✅ Modèles prêts');

        // Vérifier si l'admin existe déjà
        const existing = await User.findOne({ where: { email: ADMIN_CONFIG.email } });
        
        if (existing) {
            console.log(`\n⚠️  L'admin ${ADMIN_CONFIG.email} existe déjà.`);
            console.log(`   ID     : ${existing.id}`);
            console.log(`   Rôle   : ${existing.role}`);
            console.log(`   Statut : ${existing.statut}`);
            
            // Mise à jour du mot de passe si demandé
            const hash = await bcrypt.hash(ADMIN_CONFIG.mot_de_passe, 12);
            await existing.update({
                mot_de_passe: hash,
                role: 'admin',
                statut: 'actif',
                est_approuve: true
            });
            console.log('\n🔄 Mot de passe et droits mis à jour avec succès.');
        } else {
            // Création du nouvel admin
            const hash = await bcrypt.hash(ADMIN_CONFIG.mot_de_passe, 12);
            
            const admin = await User.create({
                id: uuidv4(),
                nom_complet: ADMIN_CONFIG.nom_complet,
                email: ADMIN_CONFIG.email,
                telephone: ADMIN_CONFIG.telephone,
                mot_de_passe: hash,
                role: ADMIN_CONFIG.role,
                statut: ADMIN_CONFIG.statut,
                est_approuve: ADMIN_CONFIG.est_approuve,
                score_confiance: ADMIN_CONFIG.score_confiance
            });
            
            console.log('\n🎉 ADMIN CRÉÉ AVEC SUCCÈS !');
            console.log('─'.repeat(40));
            console.log(`   ID       : ${admin.id}`);
            console.log(`   Nom      : ${admin.nom_complet}`);
            console.log(`   Email    : ${admin.email}`);
            console.log(`   Mot de passe : admin123!`);
            console.log(`   Rôle     : ${admin.role}`);
            console.log(`   Statut   : ${admin.statut}`);
            console.log('─'.repeat(40));
        }
        
        console.log('\n🚀 Vous pouvez maintenant vous connecter sur : http://localhost:5173/login\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erreur :', error.message);
        if (error.errors) {
            error.errors.forEach(e => console.error(`   - ${e.message}`));
        }
        process.exit(1);
    }
}

createAdmin();
