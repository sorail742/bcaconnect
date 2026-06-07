'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const addCol = async (table, col, def) => {
            try {
                await queryInterface.addColumn(table, col, def);
            } catch (_) { /* déjà présent */ }
        };
        await addCol('commandes', 'type_livraison', {
            type: Sequelize.STRING(20),
            defaultValue: 'standard',
        });
        await addCol('commandes', 'delai_estime_jours', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },
};
