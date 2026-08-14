'use strict';

const encryptionService = require('../utils/encryptionService');

/**
 * Chiffrement AES-256 de champs sensibles supplémentaires : adresse, registre_commerce,
 * numero_agrement. Élargit d'abord les colonnes (le payload chiffré iv:tag:data est plus
 * long que le texte clair), puis chiffre les valeurs déjà en clair en base.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('utilisateurs').catch(() => ({}));

        if (table.adresse && table.adresse.type !== 'VARCHAR(500)') {
            await queryInterface.changeColumn('utilisateurs', 'adresse', {
                type: Sequelize.STRING(500),
                allowNull: true,
            }).catch(() => {});
        }
        if (table.registre_commerce) {
            await queryInterface.changeColumn('utilisateurs', 'registre_commerce', {
                type: Sequelize.STRING(255),
                allowNull: true,
            }).catch(() => {});
        }
        if (table.numero_agrement) {
            await queryInterface.changeColumn('utilisateurs', 'numero_agrement', {
                type: Sequelize.STRING(255),
                allowNull: true,
            }).catch(() => {});
        }

        const [rows] = await queryInterface.sequelize.query(
            'SELECT id, adresse, registre_commerce, numero_agrement FROM utilisateurs'
        );

        for (const row of rows) {
            const updates = {};
            for (const field of ['adresse', 'registre_commerce', 'numero_agrement']) {
                const value = row[field];
                if (typeof value === 'string' && value && !value.includes(':')) {
                    updates[field] = encryptionService.encrypt(value);
                }
            }
            if (Object.keys(updates).length > 0) {
                await queryInterface.bulkUpdate('utilisateurs', updates, { id: row.id });
            }
        }
    },

    down: async () => {
        // Chiffrement non réversible automatiquement (pas de rollback en clair).
    },
};
