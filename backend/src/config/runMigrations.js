const fs = require('fs');
const path = require('path');

/**
 * Exécute les migrations versionnées depuis src/migrations/.
 * Chaque fichier n'est appliqué qu'une seule fois (table sequelize_meta).
 */
async function runMigrations(sequelize) {
    const qi = sequelize.getQueryInterface();
    const { Sequelize } = sequelize.constructor;
    const migrationsDir = path.join(__dirname, '../migrations');

    await qi.createTable('sequelize_meta', {
        name: { type: Sequelize.STRING(255), primaryKey: true },
        executed_at: { type: Sequelize.DATE, allowNull: false },
    }).catch(() => {});

    const [executed] = await sequelize.query('SELECT name FROM sequelize_meta');
    const executedNames = new Set(executed.map((row) => row.name || row.NAME));

    const files = fs.readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.js'))
        .sort();

    for (const file of files) {
        if (executedNames.has(file)) continue;

        const migration = require(path.join(migrationsDir, file));
        if (typeof migration.up !== 'function') continue;

        console.log(`🔄 Migration : ${file}`);
        await migration.up(qi, Sequelize);
        await sequelize.query(
            'INSERT INTO sequelize_meta (name, executed_at) VALUES (?, ?)',
            { replacements: [file, new Date()] },
        );
        console.log(`✅ Migration appliquée : ${file}`);
    }
}

module.exports = { runMigrations };
