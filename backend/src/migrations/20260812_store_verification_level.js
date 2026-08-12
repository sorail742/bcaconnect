'use strict';

/**
 * Vérification fournisseur à plusieurs niveaux (analyse concurrentielle #5,
 * style Alibaba Verified/Gold Supplier) — remplace le simple booléen
 * is_verified par un niveau calculé depuis le nombre de certifications
 * validées (voir certification.service.js).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('boutiques');
        if (!table.niveau_verification) {
            await queryInterface.addColumn('boutiques', 'niveau_verification', {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'non_verifie',
            });
            console.log('  + boutiques.niveau_verification');

            // Backfill : les boutiques déjà is_verified=true passent au niveau 'verifie'
            // (sera recalculé au prochain review de certification si éligible pour 'verifie_or').
            await queryInterface.sequelize.query(
                "UPDATE boutiques SET niveau_verification = 'verifie' WHERE is_verified = true"
            );
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('boutiques', 'niveau_verification').catch(() => {});
    },
};
