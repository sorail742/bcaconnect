'use strict';

/** Colonnes Credit manquantes (motif, scoring IA, metadata) */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const addColumnIfMissing = async (table, column, definition) => {
            try {
                const tableDef = await queryInterface.describeTable(table);
                if (!tableDef[column]) {
                    await queryInterface.addColumn(table, column, definition);
                    console.log(`  + ${table}.${column}`);
                }
            } catch {
                // Table absente — ignoré
            }
        };

        await addColumnIfMissing('credits', 'ia_score_solvabilite', {
            type: Sequelize.FLOAT,
            defaultValue: 0,
        });
        await addColumnIfMissing('credits', 'motif', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await addColumnIfMissing('credits', 'garanties', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await addColumnIfMissing('credits', 'metadata', {
            type: Sequelize.JSON,
            defaultValue: {},
            allowNull: true,
        });
        await addColumnIfMissing('credits', 'date_approbation', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await addColumnIfMissing('credits', 'notes_admin', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },
};
