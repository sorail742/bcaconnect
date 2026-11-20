'use strict';

/**
 * Seuils d'alerte dynamiques (cahier des charges 3.6) — un utilisateur peut
 * définir un seuil de prix ou de stock sur un produit ; alertThresholdCron
 * évalue périodiquement ces seuils et génère une Notification.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        if (!(await queryInterface.describeTable('seuils_alerte').catch(() => null))) {
            await queryInterface.createTable('seuils_alerte', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                utilisateur_id: {
                    type: Sequelize.UUID, allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' }, onDelete: 'CASCADE',
                },
                produit_id: {
                    type: Sequelize.UUID, allowNull: false,
                    references: { model: 'produits', key: 'id' }, onDelete: 'CASCADE',
                },
                type: { type: Sequelize.STRING(20), allowNull: false },
                operateur: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'inferieur_egal' },
                valeur_seuil: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
                actif: { type: Sequelize.BOOLEAN, defaultValue: true },
                dernier_declenchement: { type: Sequelize.DATE, allowNull: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('seuils_alerte', ['utilisateur_id', 'produit_id', 'type'], {
                unique: true, name: 'seuils_alerte_user_produit_type_unique',
            });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('seuils_alerte').catch(() => {});
    },
};
