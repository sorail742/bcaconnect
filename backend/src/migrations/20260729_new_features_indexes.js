'use strict';

/**
 * Index manquants sur les colonnes ajoutées par les migrations RFQ/Q&A/
 * coupons/variantes de ce lot (même démarche que 20260727_performance_indexes).
 */
module.exports = {
    up: async (queryInterface) => {
        const addIndexSafe = async (table, fields, name) => {
            try {
                await queryInterface.addIndex(table, fields, { name });
            } catch (error) {
                if (!/already exists/i.test(error.message)) throw error;
            }
        };

        await addIndexSafe('details_commandes', ['variante_id'], 'details_commandes_variante_id_idx');
        await addIndexSafe('commandes', ['coupon_id'], 'commandes_coupon_id_idx');
        await addIndexSafe('produits', ['has_variants'], 'produits_has_variants_idx');
    },

    down: async () => {},
};
