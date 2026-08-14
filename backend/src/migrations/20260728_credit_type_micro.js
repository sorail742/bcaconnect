'use strict';

/**
 * Distingue le micro-prêt (produit dédié aux sous-bancarisés — petit montant,
 * courte durée, approbation automatique si le score IA est suffisant) du
 * crédit classique. Réutilise le modèle Credit existant (mêmes échéanciers,
 * même flux d'approbation) plutôt que de dupliquer toute l'infrastructure —
 * seule la colonne `type` change, avec un défaut 'standard' pour ne rien
 * casser sur les crédits déjà existants.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('credits').catch(() => ({}));
        if (!table.type) {
            await queryInterface.addColumn('credits', 'type', {
                type: Sequelize.STRING(16),
                allowNull: false,
                defaultValue: 'standard',
            });
            await queryInterface.addIndex('credits', ['type'], { name: 'credits_type_idx' });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('credits', 'type').catch(() => {});
    },
};
