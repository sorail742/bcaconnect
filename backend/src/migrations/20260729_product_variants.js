'use strict';

/**
 * Variantes produit (taille, couleur, etc.) — style Shopify. Additif et
 * rétro-compatible : un produit sans variantes fonctionne exactement comme
 * avant (has_variants=false, variant_id NULL partout).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const variantTable = await queryInterface.describeTable('produit_variantes').catch(() => null);
        if (!variantTable) {
            await queryInterface.createTable('produit_variantes', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                produit_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'produits', key: 'id' },
                    onDelete: 'CASCADE',
                },
                nom_variante: { type: Sequelize.STRING(150), allowNull: false },
                attributs: { type: Sequelize.JSON, allowNull: false, defaultValue: {} },
                prix_unitaire: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
                stock_quantite: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
                sku: { type: Sequelize.STRING(60), allowNull: true },
                image_url: { type: Sequelize.TEXT, allowNull: true },
                actif: { type: Sequelize.BOOLEAN, defaultValue: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('produit_variantes', ['produit_id'], { name: 'produit_variantes_produit_idx' });
        }

        const productTable = await queryInterface.describeTable('produits');
        if (!productTable.has_variants) {
            await queryInterface.addColumn('produits', 'has_variants', { type: Sequelize.BOOLEAN, defaultValue: false });
        }

        const orderItemTable = await queryInterface.describeTable('details_commandes');
        if (!orderItemTable.variante_id) {
            await queryInterface.addColumn('details_commandes', 'variante_id', {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'produit_variantes', key: 'id' },
                onDelete: 'SET NULL',
            });
        }
        if (!orderItemTable.variante_nom) {
            // Copie figée du libellé au moment de l'achat — survit même si la
            // variante est supprimée ensuite (même logique que nom_destinataire sur Order).
            await queryInterface.addColumn('details_commandes', 'variante_nom', { type: Sequelize.STRING(150), allowNull: true });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('details_commandes', 'variante_nom').catch(() => {});
        await queryInterface.removeColumn('details_commandes', 'variante_id').catch(() => {});
        await queryInterface.removeColumn('produits', 'has_variants').catch(() => {});
        await queryInterface.dropTable('produit_variantes').catch(() => {});
    },
};
