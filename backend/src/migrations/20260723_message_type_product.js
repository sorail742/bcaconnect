'use strict';

/**
 * `messages.type` est un ENUM Postgres réel (enum_messages_type) — le modèle
 * Message.js autorise 'product' (partage de fiche produit depuis le bouton Chat)
 * mais le type ENUM en base ne le connaît pas encore.
 */
module.exports = {
    up: async (queryInterface) => {
        // Sur une base créée depuis le modèle actuel (sync()), messages.type
        // est un STRING(10), pas un ENUM Postgres — enum_messages_type
        // n'existe alors pas du tout, ce qui est déjà suffisant. On l'ignore.
        try {
            await queryInterface.sequelize.query(
                "ALTER TYPE enum_messages_type ADD VALUE IF NOT EXISTS 'product';"
            );
        } catch (err) {
            console.warn('  ~ migration message_type_product ignorée:', err.message);
        }
    },

    down: async () => {
        // Postgres ne permet pas de retirer une valeur d'ENUM facilement — no-op assumé sûr.
    },
};
