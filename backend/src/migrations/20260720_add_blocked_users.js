'use strict';

/** Messagerie — colonne blocked_users pour la fonctionnalité de blocage de contact. */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('utilisateurs').catch(() => ({}));
        if (table && table.blocked_users) return; // déjà présente

        await queryInterface.addColumn('utilisateurs', 'blocked_users', {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: [],
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('utilisateurs', 'blocked_users').catch(() => {});
    },
};
