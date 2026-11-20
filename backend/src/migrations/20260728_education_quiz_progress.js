'use strict';

/**
 * Formation interactive (cahier des charges 3.14) : quiz optionnel par
 * ressource + suivi de progression par utilisateur.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const quizTable = await queryInterface.describeTable('educational_quizzes').catch(() => null);
        if (!quizTable) {
            await queryInterface.createTable('educational_quizzes', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                resource_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    unique: true,
                    references: { model: 'educational_resources', key: 'id' },
                    onDelete: 'CASCADE',
                },
                questions: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
                passing_score: { type: Sequelize.INTEGER, defaultValue: 60 },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
        }

        const progressTable = await queryInterface.describeTable('educational_progress').catch(() => null);
        if (!progressTable) {
            await queryInterface.createTable('educational_progress', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                utilisateur_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                resource_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'educational_resources', key: 'id' },
                    onDelete: 'CASCADE',
                },
                statut: { type: Sequelize.STRING(20), defaultValue: 'vu' },
                quiz_score: { type: Sequelize.INTEGER, allowNull: true },
                tentatives: { type: Sequelize.INTEGER, defaultValue: 0 },
                completed_at: { type: Sequelize.DATE, allowNull: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addConstraint('educational_progress', {
                fields: ['utilisateur_id', 'resource_id'],
                type: 'unique',
                name: 'educational_progress_user_resource_unique',
            });
            await queryInterface.addIndex('educational_progress', ['utilisateur_id'], { name: 'educational_progress_user_idx' });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('educational_progress').catch(() => {});
        await queryInterface.dropTable('educational_quizzes').catch(() => {});
    },
};
