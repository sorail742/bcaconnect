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
    console.warn('\n⚠️  ALERTE : Aucune base PostgreSQL. Mode SQLite actif.\n');
}

// Sécurité JWT souple (on ne crash pas, on met un défaut)
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET MANQUANT : Utilisation d\'une clé de secours instable.');
    console.error('   Veuillez définir JWT_SECRET dans le dashboard Render.');
    process.env.JWT_SECRET = 'bca_connect_super_secret_fallback_key_2024';
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

        // 🛠️ RÉPARATION CRITIQUE : Supprime la colonne fantôme 'vendeur_id' si elle bloque la migration
        if (process.env.NODE_ENV === 'production') {
            try {
                await sequelize.query('ALTER TABLE produits DROP COLUMN IF EXISTS vendeur_id CASCADE');
                console.log('🧹 Nettoyage de la colonne "vendeur_id" (Product) réussi.');
            } catch (e) {
                console.log('ℹ️ Nettoyage non nécessaire ou déjà effectué.');
            }
        }

        // Synchronisation des modèles (Utiliser alter: true avec prudence en prod)
        await sequelize.sync({ alter: true });
        console.log('✅ Modèles synchronisés (ALTER).');

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
