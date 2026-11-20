'use strict';

/**
 * Codes promo / coupons de réduction — plateforme (créés par admin) ou boutique
 * (créés par un fournisseur, restreints à ses propres produits).
 * Le montant de la réduction est appliqué en amont, directement sur
 * `details_commandes.prix_unitaire_achat`, pour que le séquestre (calculé à
 * partir de ce champ, voir escrowService.depositOrderEscrow) reste exact —
 * jamais en simple soustraction sur le total final.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const couponTable = await queryInterface.describeTable('coupons').catch(() => null);
        if (!couponTable) {
            await queryInterface.createTable('coupons', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                code: { type: Sequelize.STRING(30), allowNull: false, unique: true },
                createur_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                boutique_id: {
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: { model: 'boutiques', key: 'id' },
                    onDelete: 'CASCADE',
                },
                type: { type: Sequelize.STRING(15), allowNull: false, defaultValue: 'percentage' }, // percentage | fixed
                valeur: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
                montant_min: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
                date_debut: { type: Sequelize.DATE, allowNull: true },
                date_fin: { type: Sequelize.DATE, allowNull: true },
                usage_max: { type: Sequelize.INTEGER, allowNull: true },
                usage_max_par_utilisateur: { type: Sequelize.INTEGER, defaultValue: 1 },
                usage_count: { type: Sequelize.INTEGER, defaultValue: 0 },
                actif: { type: Sequelize.BOOLEAN, defaultValue: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('coupons', ['code'], { name: 'coupons_code_idx' });
            await queryInterface.addIndex('coupons', ['boutique_id'], { name: 'coupons_boutique_idx' });
        }

        const usageTable = await queryInterface.describeTable('coupon_usages').catch(() => null);
        if (!usageTable) {
            await queryInterface.createTable('coupon_usages', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                coupon_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'coupons', key: 'id' },
                    onDelete: 'CASCADE',
                },
                utilisateur_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                commande_id: {
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: { model: 'commandes', key: 'id' },
                    onDelete: 'SET NULL',
                },
                montant_reduction: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('coupon_usages', ['coupon_id', 'utilisateur_id'], { name: 'coupon_usages_coupon_user_idx' });
        }

        const orderTable = await queryInterface.describeTable('commandes');
        if (!orderTable.coupon_id) {
            await queryInterface.addColumn('commandes', 'coupon_id', {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'coupons', key: 'id' },
                onDelete: 'SET NULL',
            });
        }
        if (!orderTable.code_promo) {
            await queryInterface.addColumn('commandes', 'code_promo', { type: Sequelize.STRING(30), allowNull: true });
        }
        if (!orderTable.montant_reduction) {
            await queryInterface.addColumn('commandes', 'montant_reduction', { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('commandes', 'montant_reduction').catch(() => {});
        await queryInterface.removeColumn('commandes', 'code_promo').catch(() => {});
        await queryInterface.removeColumn('commandes', 'coupon_id').catch(() => {});
        await queryInterface.dropTable('coupon_usages').catch(() => {});
        await queryInterface.dropTable('coupons').catch(() => {});
    },
};
