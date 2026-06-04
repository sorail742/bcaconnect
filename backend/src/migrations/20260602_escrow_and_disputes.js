'use strict';

/** Migration : escrow_released + champs litiges financiers */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tableInfo = async (table) => {
            try {
                return await queryInterface.describeTable(table);
            } catch {
                return null;
            }
        };

        const orderItems = await tableInfo('details_commandes');
        if (orderItems && !orderItems.escrow_released) {
            await queryInterface.addColumn('details_commandes', 'escrow_released', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            });
        }

        const litiges = await tableInfo('litiges');
        if (litiges) {
            if (!litiges.resolution_type) {
                await queryInterface.addColumn('litiges', 'resolution_type', {
                    type: Sequelize.STRING(50),
                    allowNull: true,
                });
            }
            if (!litiges.remboursement_montant) {
                await queryInterface.addColumn('litiges', 'remboursement_montant', {
                    type: Sequelize.DECIMAL(15, 2),
                    allowNull: true,
                });
            }
            if (!litiges.preuves) {
                await queryInterface.addColumn('litiges', 'preuves', {
                    type: Sequelize.TEXT,
                    allowNull: true,
                });
            }
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('details_commandes', 'escrow_released').catch(() => {});
        await queryInterface.removeColumn('litiges', 'resolution_type').catch(() => {});
        await queryInterface.removeColumn('litiges', 'remboursement_montant').catch(() => {});
    },
};
