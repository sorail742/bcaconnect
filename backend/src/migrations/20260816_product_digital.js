'use strict';

/**
 * Revente de services/biens numériques par les vendeurs (analyse
 * concurrentielle #7) — un produit numérique livre contenu_numerique
 * instantanément par notification à l'achat, sans flux transporteur/OTP.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('produits');

        if (!table.est_numerique) {
            await queryInterface.addColumn('produits', 'est_numerique', {
                type: Sequelize.BOOLEAN, defaultValue: false,
            });
        }
        if (!table.contenu_numerique) {
            await queryInterface.addColumn('produits', 'contenu_numerique', {
                type: Sequelize.TEXT, allowNull: true,
            });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('produits', 'contenu_numerique').catch(() => {});
        await queryInterface.removeColumn('produits', 'est_numerique').catch(() => {});
    },
};
