'use strict';

/**
 * `audit_logs` grossit à chaque requête mutante de la plateforme (déjà 15k+ lignes
 * en développement) et n'avait aucun index hormis la clé primaire — chaque filtre
 * du Journal d'activité (date, niveau, IP, utilisateur) forçait un scan complet
 * de la table. Ajout des index nécessaires pour des filtres rapides et fiables.
 */
module.exports = {
    up: async (queryInterface) => {
        const addIndexSafe = async (fields, options) => {
            try {
                await queryInterface.addIndex('audit_logs', fields, options);
            } catch (error) {
                if (!/already exists/i.test(error.message)) throw error;
            }
        };

        await addIndexSafe(['created_at'], { name: 'audit_logs_created_at_idx' });
        await addIndexSafe(['niveau_alerte'], { name: 'audit_logs_niveau_alerte_idx' });
        await addIndexSafe(['utilisateur_id'], { name: 'audit_logs_utilisateur_id_idx' });
        await addIndexSafe(['adresse_ip'], { name: 'audit_logs_adresse_ip_idx' });

        // Normalise les IPv4 mappées en IPv6 déjà enregistrées (::ffff:127.0.0.1 → 127.0.0.1)
        // pour rester cohérent avec la normalisation désormais appliquée à l'écriture.
        await queryInterface.sequelize.query(
            "UPDATE audit_logs SET adresse_ip = SUBSTRING(adresse_ip FROM 8) WHERE adresse_ip LIKE '::ffff:%'"
        );
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('audit_logs', 'audit_logs_created_at_idx').catch(() => {});
        await queryInterface.removeIndex('audit_logs', 'audit_logs_niveau_alerte_idx').catch(() => {});
        await queryInterface.removeIndex('audit_logs', 'audit_logs_utilisateur_id_idx').catch(() => {});
        await queryInterface.removeIndex('audit_logs', 'audit_logs_adresse_ip_idx').catch(() => {});
    },
};
