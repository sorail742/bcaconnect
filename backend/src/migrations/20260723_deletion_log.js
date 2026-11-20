'use strict';

/**
 * Historique infini des suppressions (`deletion_logs`) — jamais purgé,
 * indépendant des tables d'origine, pour que l'admin puisse retrouver la
 * preuve de ce qui a été supprimé même si l'enregistrement et son auteur
 * ont eux-mêmes disparu depuis.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const existingTable = await queryInterface.describeTable('deletion_logs').catch(() => null);

        if (!existingTable) {
            await queryInterface.createTable('deletion_logs', {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
                },
                table_affectee: { type: Sequelize.STRING(50), allowNull: false },
                id_enregistrement: { type: Sequelize.STRING(100) },
                libelle: { type: Sequelize.STRING(255) },
                snapshot: { type: Sequelize.JSONB, allowNull: false },
                supprime_par: { type: Sequelize.UUID },
                supprime_par_nom: { type: Sequelize.STRING(255) },
                confirmation_saisie: { type: Sequelize.STRING(255) },
                adresse_ip: { type: Sequelize.STRING(45) },
                agent_utilisateur: { type: Sequelize.TEXT },
                restaure: { type: Sequelize.BOOLEAN, defaultValue: false },
                restaure_le: { type: Sequelize.DATE },
                restaure_par: { type: Sequelize.UUID },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('deletion_logs', ['table_affectee']);
            await queryInterface.addIndex('deletion_logs', ['id_enregistrement']);
            await queryInterface.addIndex('deletion_logs', ['created_at']);
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('deletion_logs').catch(() => {});
    },
};
