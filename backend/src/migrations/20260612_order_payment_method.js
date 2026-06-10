'use strict';

/** Colonne methode_paiement sur commandes */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            const tableDef = await queryInterface.describeTable('commandes');
            if (!tableDef.methode_paiement) {
                await queryInterface.addColumn('commandes', 'methode_paiement', {
                    type: Sequelize.STRING(32),
                    allowNull: true,
                });
                console.log('  + commandes.methode_paiement');
            }
        } catch (err) {
            console.warn('  ~ migration methode_paiement ignorée:', err.message);
        }
    },

    down: async (queryInterface) => {
        try {
            await queryInterface.removeColumn('commandes', 'methode_paiement');
        } catch {
            // noop
        }
    },
};
