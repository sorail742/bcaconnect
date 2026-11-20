'use strict';

/** Colonnes User manquantes (location GPS transporteur, champs technicien) */
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
                // Table absente
            }
        };

        await addColumnIfMissing('utilisateurs', 'specialites', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await addColumnIfMissing('utilisateurs', 'numero_agrement', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await addColumnIfMissing('utilisateurs', 'zone_intervention', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await addColumnIfMissing('utilisateurs', 'location', {
            type: Sequelize.JSON,
            allowNull: true,
        });
        await addColumnIfMissing('utilisateurs', 'avatar_url', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await addColumnIfMissing('utilisateurs', 'points_fidelite', {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: true,
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('utilisateurs', 'location').catch(() => {});
    },
};
