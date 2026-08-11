'use strict';

/**
 * Réapprovisionnement automatique sur seuil de stock (analyse concurrentielle
 * #4 — Wasoko/OmniBiz). Le vendeur configure un seuil et une quantité ; quand
 * stock_quantite passe sous le seuil, stockAlertCron incrémente
 * automatiquement le stock au lieu de se contenter d'alerter.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('produits');

        if (!table.reappro_auto_actif) {
            await queryInterface.addColumn('produits', 'reappro_auto_actif', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
            console.log('  + produits.reappro_auto_actif');
        }

        if (!table.reappro_seuil) {
            await queryInterface.addColumn('produits', 'reappro_seuil', {
                type: Sequelize.INTEGER,
                allowNull: true,
            });
            console.log('  + produits.reappro_seuil');
        }

        if (!table.reappro_quantite) {
            await queryInterface.addColumn('produits', 'reappro_quantite', {
                type: Sequelize.INTEGER,
                allowNull: true,
            });
            console.log('  + produits.reappro_quantite');
        }

        if (!table.reappro_derniere_execution) {
            await queryInterface.addColumn('produits', 'reappro_derniere_execution', {
                type: Sequelize.DATE,
                allowNull: true,
            });
            console.log('  + produits.reappro_derniere_execution');
        }
    },

    down: async (queryInterface) => {
        for (const col of ['reappro_auto_actif', 'reappro_seuil', 'reappro_quantite', 'reappro_derniere_execution']) {
            await queryInterface.removeColumn('produits', col).catch(() => {});
        }
    },
};
