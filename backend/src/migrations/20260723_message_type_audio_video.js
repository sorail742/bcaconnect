'use strict';

/**
 * `messages.type` (ENUM Postgres) n'avait que 'text', 'image', 'file' — 'audio' et
 * 'video' sont autorisés par le modèle Message.js et gérés par le frontend
 * (messages vocaux, clips vidéo) mais auraient échoué en base avec la même erreur
 * "invalid input value for enum" que 'product'.
 */
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(
            "ALTER TYPE enum_messages_type ADD VALUE IF NOT EXISTS 'audio';"
        );
        await queryInterface.sequelize.query(
            "ALTER TYPE enum_messages_type ADD VALUE IF NOT EXISTS 'video';"
        );
    },

    down: async () => {
        // Postgres ne permet pas de retirer une valeur d'ENUM facilement — no-op assumé sûr.
    },
};
