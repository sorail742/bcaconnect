'use strict';

/**
 * Comptes entreprise multi-utilisateurs + workflow d'approbation
 * (analyse concurrentielle #2).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        if (!(await queryInterface.describeTable('organisations').catch(() => null))) {
            await queryInterface.createTable('organisations', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                nom: { type: Sequelize.STRING(150), allowNull: false },
                proprietaire_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                plafond_approbation_auto: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
                actif: { type: Sequelize.BOOLEAN, defaultValue: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
        }

        if (!(await queryInterface.describeTable('organisation_membres').catch(() => null))) {
            await queryInterface.createTable('organisation_membres', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                organization_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'organisations', key: 'id' },
                    onDelete: 'CASCADE',
                },
                user_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                role: { type: Sequelize.ENUM('acheteur', 'valideur', 'admin'), allowNull: false, defaultValue: 'acheteur' },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('organisation_membres', ['organization_id', 'user_id'], { unique: true, name: 'organisation_membres_org_user_unique' });
        }

        if (!(await queryInterface.describeTable('organisation_demandes_achat').catch(() => null))) {
            await queryInterface.createTable('organisation_demandes_achat', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                organization_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'organisations', key: 'id' },
                    onDelete: 'CASCADE',
                },
                demandeur_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                payload: { type: Sequelize.JSON, allowNull: false },
                montant_estime: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
                statut: { type: Sequelize.ENUM('en_attente', 'approuvee', 'rejetee'), allowNull: false, defaultValue: 'en_attente' },
                traite_par_id: { type: Sequelize.UUID, allowNull: true },
                commentaire: { type: Sequelize.TEXT, allowNull: true },
                commande_id: { type: Sequelize.UUID, allowNull: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('organisation_demandes_achat', ['organization_id', 'statut'], { name: 'org_demandes_achat_org_statut_idx' });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('organisation_demandes_achat').catch(() => {});
        await queryInterface.dropTable('organisation_membres').catch(() => {});
        await queryInterface.dropTable('organisations').catch(() => {});
    },
};
