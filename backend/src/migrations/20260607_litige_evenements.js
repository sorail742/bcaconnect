'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('litige_evenements', {
            id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
            litige_id: { type: Sequelize.UUID, allowNull: false },
            auteur_id: { type: Sequelize.UUID, allowNull: true },
            type: { type: Sequelize.STRING(40), allowNull: false },
            message: { type: Sequelize.TEXT, allowNull: false },
            meta: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false },
        }).catch(() => {});
    },
};
