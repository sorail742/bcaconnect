'use strict';

/**
 * `messages.type` est un ENUM Postgres réel (enum_messages_type) — le modèle
 * Message.js autorise 'product' (partage de fiche produit depuis le bouton Chat)
 * mais le type ENUM en base ne le connaît pas encore.
 */
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(
            "ALTER TYPE enum_messages_type ADD VALUE IF NOT EXISTS 'product';"
        );
    },

    down: async () => {
        // Postgres ne permet pas de retirer une valeur d'ENUM facilement — no-op assumé sûr.
    },
};
