'use strict';

const crypto = require('crypto');

/**
 * Vendor Ads fix : colonne priorite (dropée silencieusement par Sequelize jusqu'ici)
 * + backfill des publicités existantes créées sans ciblage (jamais diffusées via /ads/serve,
 * l'include PubliciteCiblage y étant un inner join) et sans budget (mortes dès leur création
 * par le filtre budget_restant > 0 du même endpoint).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('publicites').catch(() => ({}));
        if (!table.priorite) {
            await queryInterface.addColumn('publicites', 'priorite', {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 1,
            });
        }

        const [adsWithoutTargeting] = await queryInterface.sequelize.query(`
            SELECT p.id FROM publicites p
            LEFT JOIN ciblage_publicites c ON c.publicite_id = p.id
            WHERE c.id IS NULL
        `).catch(() => [[]]);

        if (adsWithoutTargeting && adsWithoutTargeting.length > 0) {
            const now = new Date();
            await queryInterface.bulkInsert('ciblage_publicites', adsWithoutTargeting.map((ad) => ({
                id: crypto.randomUUID(),
                publicite_id: ad.id,
                role_cible: 'all',
                createdAt: now,
                updatedAt: now,
            })));
        }

        await queryInterface.bulkUpdate('publicites',
            { budget_total: 500000, budget_restant: 500000 },
            { budget_total: 0 }
        ).catch(() => {});
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('publicites', 'priorite').catch(() => {});
    },
};
