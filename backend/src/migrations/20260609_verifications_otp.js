'use strict';

/** Phase 1 — table verifications_otp (cahier des charges) */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tables = await queryInterface.showAllTables();
        const exists = tables.some((t) => String(t).toLowerCase() === 'verifications_otp');
        if (exists) return;

        await queryInterface.createTable('verifications_otp', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            telephone: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(10),
                allowNull: false,
            },
            type_action: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            expire_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            est_utilise: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addIndex('verifications_otp', ['telephone', 'type_action', 'est_utilise'], {
            name: 'idx_otp_telephone_action',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('verifications_otp');
    },
};
