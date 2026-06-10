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
