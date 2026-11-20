'use strict';

/** Ajoute les types de notification manquants dans l'ENUM PostgreSQL */
module.exports = {
    up: async (queryInterface) => {
        const addEnumValue = async (value) => {
            try {
                await queryInterface.sequelize.query(
                    `ALTER TYPE enum_notifications_type ADD VALUE IF NOT EXISTS '${value}'`,
                );
                console.log(`  + enum_notifications_type.${value}`);
            } catch (err) {
                console.warn(`  ~ enum_notifications_type.${value}:`, err.message);
            }
        };

        for (const value of ['delivery', 'sav', 'credit', 'dispute']) {
            await addEnumValue(value);
        }
    },

    down: async () => {},
};
