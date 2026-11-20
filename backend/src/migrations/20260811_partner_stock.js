'use strict';

/**
 * Stock partenaire/entrepôt tiers (cahier des charges 2.5) — distinct du
 * stock propre du vendeur (produits.stock_quantite).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('stocks_partenaires').catch(() => null);
        if (!table) {
            await queryInterface.createTable('stocks_partenaires', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                produit_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'produits', key: 'id' },
                    onDelete: 'CASCADE',
                },
                partenaire_nom: { type: Sequelize.STRING(150), allowNull: false },
                partenaire_contact: { type: Sequelize.STRING(150), allowNull: true },
                type_stock: {
                    type: Sequelize.ENUM('consigne', 'entrepot_tiers', 'dropshipping'),
                    allowNull: false,
                    defaultValue: 'entrepot_tiers',
                },
                quantite: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
                localisation: { type: Sequelize.STRING(200), allowNull: true },
                notes: { type: Sequelize.TEXT, allowNull: true },
                derniere_synchro: { type: Sequelize.DATE, allowNull: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('stocks_partenaires', ['produit_id'], { name: 'stocks_partenaires_produit_idx' });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('stocks_partenaires').catch(() => {});
    },
};
