'use strict';

/**
 * `messages.type` (ENUM Postgres) n'avait que 'text', 'image', 'file' — 'audio' et
 * 'video' sont autorisés par le modèle Message.js et gérés par le frontend
 * (messages vocaux, clips vidéo) mais auraient échoué en base avec la même erreur
 * "invalid input value for enum" que 'product'.
 */
module.exports = {
    up: async (queryInterface) => {
        // messages.type est un STRING(10) dans le modèle actuel (plus un ENUM
        // Postgres) — sur une base créée depuis ce modèle (sync()), le type
        // enum_messages_type n'existe pas du tout, ce qui est déjà suffisant
        // pour stocker 'audio'/'video'. Ce cas ne casse rien : on l'ignore.
        try {
            await queryInterface.sequelize.query(
                "ALTER TYPE enum_messages_type ADD VALUE IF NOT EXISTS 'audio';"
            );
            await queryInterface.sequelize.query(
                "ALTER TYPE enum_messages_type ADD VALUE IF NOT EXISTS 'video';"
            );
        } catch (err) {
            console.warn('  ~ migration message_type_audio_video ignorée:', err.message);
        }
    },

    down: async () => {
        // Postgres ne permet pas de retirer une valeur d'ENUM facilement — no-op assumé sûr.
    },
};
