#!/usr/bin/env node
/**
 * Vérifie la connexion Postgres et applique les migrations versionnées.
 * Usage : DATABASE_URL=postgresql://... node scripts/verify-postgres.js
 */
require('dotenv').config();

const { runMigrations } = require('../src/config/runMigrations');

async function main() {
    const url = process.env.DATABASE_URL || '';
    if (!url.startsWith('postgres')) {
        console.error('❌ DATABASE_URL doit pointer vers PostgreSQL (ex. postgresql://user:pass@localhost:5433/bcaconnect)');
        process.exit(1);
    }

    delete process.env.USE_LOCAL_DB;
    const sequelize = require('../src/config/database');

    try {
        await sequelize.authenticate();
        console.log('✅ Connexion Postgres OK');

        await runMigrations(sequelize);
        console.log('✅ Migrations appliquées');

        const [tables] = await sequelize.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        console.log(`📋 ${tables.length} tables dans le schéma public`);
        tables.slice(0, 10).forEach((t) => console.log(`   • ${t.tablename}`));
        if (tables.length > 10) console.log(`   … et ${tables.length - 10} autres`);

        await sequelize.close();
        console.log('\n🎉 Postgres prêt pour Phase 3');
        process.exit(0);
    } catch (err) {
        console.error('❌ Échec vérification Postgres :', err.message);

        if (err.message.includes('password authentication failed')) {
            console.error('');
            console.error('💡 Diagnostic :');
            console.error('   • Docker n\'a peut‑être pas démarré (permission sur docker.sock ?)');
            console.error('   • Un autre Postgres écoute sur le port 5433 avec d\'autres identifiants');
            console.error('   • Volume Docker ancien — reset : docker compose down -v && ./scripts/docker-dev.sh');
            console.error('');
            console.error('   Dev immédiat sans Postgres :');
            console.error('     ./scripts/dev-backend.sh');
            console.error('     # ou : env -u DATABASE_URL USE_LOCAL_DB=true PORT=5001 npm run dev');
        } else if (err.message.includes('ECONNREFUSED') || err.message.includes('connect')) {
            console.error('');
            console.error('💡 Aucun Postgres sur ce port. Lancez : ./scripts/docker-dev.sh');
            console.error('   Ou dev SQLite : ./scripts/dev-backend.sh');
        }

        try { await sequelize.close(); } catch (_) {}
        process.exit(1);
    }
}

main();
