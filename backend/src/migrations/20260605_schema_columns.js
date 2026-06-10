'use strict';

/** Colonnes schéma — anciennement gérées par runSafeMigrations au boot */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const addColumnIfMissing = async (table, column, definition) => {
            try {
                const tableDef = await queryInterface.describeTable(table);
                if (!tableDef[column]) {
                    await queryInterface.addColumn(table, column, definition);
                }
            } catch {
                // Table absente — ignoré (sync la créera)
            }
        };

        const bool = (defaultValue = false) => ({
            type: Sequelize.BOOLEAN,
            defaultValue,
            allowNull: false,
        });

        await addColumnIfMissing('boutiques', 'use_carousel', bool(false));
        await addColumnIfMissing('boutiques', 'banner_images', { type: Sequelize.TEXT, allowNull: true });
        await addColumnIfMissing('boutiques', 'is_verified', { type: Sequelize.BOOLEAN, defaultValue: false });
        await addColumnIfMissing('boutiques', 'rating', { type: Sequelize.FLOAT, defaultValue: 4.5 });

        await addColumnIfMissing('utilisateurs', 'avatar_url', { type: Sequelize.STRING(255), allowNull: true });
        await addColumnIfMissing('utilisateurs', 'points_fidelite', { type: Sequelize.INTEGER, defaultValue: 0 });
        await addColumnIfMissing('utilisateurs', 'specialites', { type: Sequelize.STRING(255), allowNull: true });
        await addColumnIfMissing('utilisateurs', 'numero_agrement', { type: Sequelize.STRING(100), allowNull: true });
        await addColumnIfMissing('utilisateurs', 'zone_intervention', { type: Sequelize.STRING(255), allowNull: true });
        await addColumnIfMissing('utilisateurs', 'location', { type: Sequelize.JSON, allowNull: true });

        await addColumnIfMissing('produits', 'condition', { type: Sequelize.STRING(20), defaultValue: 'neuf' });
        await addColumnIfMissing('produits', 'marque', { type: Sequelize.STRING(100), allowNull: true });
        await addColumnIfMissing('produits', 'is_featured', { type: Sequelize.BOOLEAN, defaultValue: false });
        await addColumnIfMissing('produits', 'unite_mesure', { type: Sequelize.STRING(50), defaultValue: 'Pièce', allowNull: true });
        await addColumnIfMissing('produits', 'mots_cles', { type: Sequelize.JSON, defaultValue: [], allowNull: true });

        await addColumnIfMissing('categories', 'image_url', { type: Sequelize.STRING, allowNull: true });
        await addColumnIfMissing('commandes', 'delivery_group_id', { type: Sequelize.UUID, allowNull: true });
        await addColumnIfMissing('details_commandes', 'escrow_released', bool(false));
        await addColumnIfMissing('litiges', 'resolution_type', { type: Sequelize.STRING(50), allowNull: true });
        await addColumnIfMissing('litiges', 'remboursement_montant', { type: Sequelize.DECIMAL(15, 2), allowNull: true });
        await addColumnIfMissing('litiges', 'preuves', { type: Sequelize.TEXT, allowNull: true });
    },
};
