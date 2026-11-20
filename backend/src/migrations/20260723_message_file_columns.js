'use strict';

/**
 * Colonnes de pièce jointe manquantes sur `messages` (présentes dans le modèle
 * Message.js depuis l'ajout du partage de fichiers, jamais migrées en base) —
 * cause racine du blocage total d'envoi de messages : chaque Message.create()
 * échouait avec "column file_url of relation messages does not exist".
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('messages').catch(() => ({}));

        if (!table.file_url) {
            await queryInterface.addColumn('messages', 'file_url', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }
        if (!table.file_name) {
            await queryInterface.addColumn('messages', 'file_name', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }
        if (!table.file_size) {
            await queryInterface.addColumn('messages', 'file_size', {
                type: Sequelize.INTEGER,
                allowNull: true,
            });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('messages', 'file_url').catch(() => {});
        await queryInterface.removeColumn('messages', 'file_name').catch(() => {});
        await queryInterface.removeColumn('messages', 'file_size').catch(() => {});
    },
};
