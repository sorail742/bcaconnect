'use strict';

/** Harmonise les anciennes valeurs statut (paye → payé). */
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
            UPDATE commandes SET statut = 'payé' WHERE statut = 'paye'
        `);
    },

    down: async () => {},
};
