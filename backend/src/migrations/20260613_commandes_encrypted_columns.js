'use strict';

/**
 * Élargit les colonnes commandes pour le chiffrement AES (iv:tag:data > 32 car.).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const widen = async (column, definition) => {
            try {
                const tableDef = await queryInterface.describeTable('commandes');
                if (tableDef[column]) {
                    await queryInterface.changeColumn('commandes', column, definition);
                    console.log(`  ~ commandes.${column} élargi`);
                }
            } catch (err) {
                console.warn(`  ~ commandes.${column}:`, err.message);
            }
        };

        await widen('telephone_livraison', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await widen('adresse_livraison', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await widen('cle_idempotence', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await widen('statut', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
    },

    down: async () => {
        // Pas de retour arrière — risque de tronquer des données chiffrées
    },
};
