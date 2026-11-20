#!/usr/bin/env node
/**
 * Applique les migrations SQL versionnées (src/migrations/).
 * Usage: npm run migrate
 */
require('dotenv').config();

const { sequelize } = require('../src/models');
const { runMigrations } = require('../src/config/runMigrations');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion base de données établie.');

        // Les migrations versionnées de src/migrations/ ne gèrent que des
        // ajustements incrémentaux (nouvelles colonnes/tables) — elles
        // supposent que le schéma de base (tables générées depuis les
        // modèles Sequelize, ex. "commandes") existe déjà. En usage normal,
        // il est créé par sequelize.sync() au démarrage du serveur
        // (src/index.js). Sur une base neuve où le serveur n'a jamais
        // tourné (CI, premier setup local), migrate seul échouait donc avec
        // des erreurs "relation ... does not exist". sync() sans force/alter
        // est non destructif (ne crée que les tables manquantes) : sûr à
        // rejouer à chaque fois, y compris sur une base déjà à jour.
        await sequelize.sync();
        console.log('✅ Schéma de base synchronisé (tables manquantes créées si besoin).');

        await runMigrations(sequelize);
        console.log('✅ Migrations terminées.');
        process.exit(0);
    } catch (err) {
        console.error('🔴 Échec des migrations:', err.message);
        process.exit(1);
    } finally {
        await sequelize.close().catch(() => {});
    }
})();
