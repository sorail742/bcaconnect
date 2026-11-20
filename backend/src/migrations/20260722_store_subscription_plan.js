'use strict';

/** Abonnement boutique — plan (gratuit / pro) et date d'expiration, pour lever le
 * plafond de produits du plan gratuit une fois la boutique abonnée. */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('boutiques').catch(() => ({}));

        if (!table.plan) {
            await queryInterface.addColumn('boutiques', 'plan', {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'gratuit',
            });
        }

        if (!table.plan_expire_le) {
            await queryInterface.addColumn('boutiques', 'plan_expire_le', {
                type: Sequelize.DATE,
                allowNull: true,
            });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('boutiques', 'plan').catch(() => {});
        await queryInterface.removeColumn('boutiques', 'plan_expire_le').catch(() => {});
    },
};
