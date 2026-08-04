'use strict';

/**
 * Délai de livraison : date d'échéance concrète calculée à la commande (au lieu
 * du seul nombre de jours estimé déjà présent) — permet d'afficher un vrai compte
 * à rebours et de détecter les livraisons en retard.
 * Spécialité requise : type de technicien nécessaire pour une intervention SAV,
 * pour empêcher un technicien d'une autre spécialité de l'accepter.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const commandes = await queryInterface.describeTable('commandes').catch(() => ({}));
        if (!commandes.date_livraison_prevue) {
            await queryInterface.addColumn('commandes', 'date_livraison_prevue', {
                type: Sequelize.DATE,
                allowNull: true,
            });
        }

        const interventions = await queryInterface.describeTable('interventions').catch(() => ({}));
        if (!interventions.specialite_requise) {
            await queryInterface.addColumn('interventions', 'specialite_requise', {
                type: Sequelize.STRING(50),
                allowNull: true,
            });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('commandes', 'date_livraison_prevue').catch(() => {});
        await queryInterface.removeColumn('interventions', 'specialite_requise').catch(() => {});
    },
};
