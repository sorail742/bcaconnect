'use strict';

/** Phase 3.7 — colonne code_pin_offline pour l'authentification hors ligne (PIN haché). */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('utilisateurs').catch(() => ({}));
        if (table && table.code_pin_offline) return; // déjà présente

        await queryInterface.addColumn('utilisateurs', 'code_pin_offline', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('utilisateurs', 'code_pin_offline').catch(() => {});
    },
};
