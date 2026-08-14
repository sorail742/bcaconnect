'use strict';

/** SAV — colonne photos_urls manquante sur interventions (présente dans le modèle, absente en base). */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('interventions').catch(() => ({}));
        if (table && table.photos_urls) return; // déjà présente

        await queryInterface.addColumn('interventions', 'photos_urls', {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: [],
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('interventions', 'photos_urls').catch(() => {});
    },
};
