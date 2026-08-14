'use strict';

/**
 * Questions/Réponses produit (style Amazon) — un acheteur pose une question
 * publique sur un produit, le fournisseur (ou l'admin) y répond.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('questions_produits').catch(() => null);
        if (!table) {
            await queryInterface.createTable('questions_produits', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                produit_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'produits', key: 'id' },
                    onDelete: 'CASCADE',
                },
                utilisateur_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                question: { type: Sequelize.TEXT, allowNull: false },
                reponse: { type: Sequelize.TEXT, allowNull: true },
                repondu_par: {
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'SET NULL',
                },
                repondu_at: { type: Sequelize.DATE, allowNull: true },
                utile_count: { type: Sequelize.INTEGER, defaultValue: 0 },
                visible: { type: Sequelize.BOOLEAN, defaultValue: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('questions_produits', ['produit_id'], { name: 'questions_produits_produit_idx' });
            await queryInterface.addIndex('questions_produits', ['utilisateur_id'], { name: 'questions_produits_user_idx' });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('questions_produits').catch(() => {});
    },
};
