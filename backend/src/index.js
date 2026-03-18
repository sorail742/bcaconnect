#!/usr/bin/env node
/**
 * BCA Connect — Script de démarrage pour la production.
 * Vérifie les variables d'environnement essentielles avant de lancer le serveur.
 */
require('dotenv').config(); // ← Doit être PREMIER

require('dotenv').config();

const requiredVars = ['JWT_SECRET'];

// Vérification de la Base de Données
const hasDbUrl = !!process.env.DATABASE_URL;
const hasDbVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'].every(v => !!process.env[v]);

if (!hasDbUrl && !hasDbVars) {
    console.warn('\n⚠️  ALERTE : Aucune base de données externe configurée (DATABASE_URL manquante).');
    console.warn('   L\'API va démarrer en mode dégradé avec SQLite (/tmp/bcaconnect).\n');
}

// Vérification des secrets critiques
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    console.error(`\n❌ ERREUR CRITIQUE : Variables manquantes : ${missing.join(', ')}`);
    console.error('   Vérifiez l\'onglet Environment sur Render pour ajouter JWT_SECRET.\n');
    // On ne crash pas le démarrage en dev, mais en prod oui pour la sécurité
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        // Vérification de la connexion à la base de données
        await sequelize.authenticate();
        console.log('✅ Connexion PostgreSQL établie.');

        // Synchronisation des modèles (sans casser les données en prod)
        await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
        console.log('✅ Modèles synchronisés.');

        app.listen(PORT, () => {
            console.log(`\n🚀 BCA Connect API v2.5 — Port ${PORT} (${process.env.NODE_ENV || 'development'})`);
            console.log(`   Health check : http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        console.error('❌ Échec du démarrage du serveur :', error.message);
        process.exit(1);
    }
};

start();
