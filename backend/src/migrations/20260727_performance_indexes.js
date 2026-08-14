'use strict';

/**
 * Aucune colonne de clé étrangère n'était indexée sur les tables métier
 * principales (seules les clés primaires et quelques contraintes uniques
 * l'étaient) — chaque "mes commandes", "mon portefeuille", "mes messages",
 * "mes notifications", etc. forçait un scan complet. Sans effet mesurable
 * aujourd'hui (faible volume de données de dev), mais nécessaire avant toute
 * croissance réelle du trafic. Même démarche que pour audit_logs.
 *
 * Nettoie aussi deux paires d'index uniques dupliqués (créés par des
 * exécutions successives de sync/migrations) qui alourdissent chaque écriture
 * pour rien : utilisateurs.email/telephone et boutiques.slug avaient chacun
 * deux contraintes uniques identiques.
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

        // Ces doublons sont en réalité des CONTRAINTES uniques (pas de simples index) :
        // Postgres exige DROP CONSTRAINT, pas DROP INDEX, sans quoi il refuse ("requires it").
        const dropConstraintSafe = async (table, name) => {
            await queryInterface.sequelize.query(
                `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${name}"`
            );
        };

        // ── Commandes & détails ──────────────────────────────────────────
        await addIndexSafe('commandes', ['utilisateur_id'], 'commandes_utilisateur_id_idx');
        await addIndexSafe('commandes', ['transporteur_id'], 'commandes_transporteur_id_idx');
        await addIndexSafe('commandes', ['statut'], 'commandes_statut_idx');
        await addIndexSafe('details_commandes', ['commande_id'], 'details_commandes_commande_id_idx');
        await addIndexSafe('details_commandes', ['produit_id'], 'details_commandes_produit_id_idx');
        await addIndexSafe('details_commandes', ['fournisseur_id'], 'details_commandes_fournisseur_id_idx');

        // ── Catalogue ─────────────────────────────────────────────────────
        await addIndexSafe('produits', ['boutique_id'], 'produits_boutique_id_idx');
        await addIndexSafe('produits', ['categorie_id'], 'produits_categorie_id_idx');
        await addIndexSafe('images_produits', ['produit_id'], 'images_produits_produit_id_idx');
        await addIndexSafe('boutiques', ['proprietaire_id'], 'boutiques_proprietaire_id_idx');
        await addIndexSafe('boutiques', ['statut'], 'boutiques_statut_idx');
        await addIndexSafe('reviews', ['produit_id'], 'reviews_produit_id_idx');
        await addIndexSafe('reviews', ['utilisateur_id'], 'reviews_utilisateur_id_idx');

        // ── Finance ───────────────────────────────────────────────────────
        await addIndexSafe('transactions', ['portefeuille_id'], 'transactions_portefeuille_id_idx');
        await addIndexSafe('transactions', ['commande_id'], 'transactions_commande_id_idx');
        await addIndexSafe('transactions', ['statut'], 'transactions_statut_idx');
        await addIndexSafe('portefeuilles', ['user_id'], 'portefeuilles_user_id_idx');
        await addIndexSafe('credits', ['utilisateur_id'], 'credits_utilisateur_id_idx');
        await addIndexSafe('credits', ['statut'], 'credits_statut_idx');
        await addIndexSafe('echeanciers', ['credit_id'], 'echeanciers_credit_id_idx');

        // ── Messagerie ────────────────────────────────────────────────────
        await addIndexSafe('messages', ['conversation_id'], 'messages_conversation_id_idx');
        await addIndexSafe('messages', ['expediteur_id'], 'messages_expediteur_id_idx');
        await addIndexSafe('conversation_participants', ['user_id'], 'conversation_participants_user_id_idx');
        await addIndexSafe('notifications', ['utilisateur_id'], 'notifications_utilisateur_id_idx');

        // ── Litiges & SAV ─────────────────────────────────────────────────
        await addIndexSafe('litiges', ['commande_id'], 'litiges_commande_id_idx');
        await addIndexSafe('litiges', ['demandeur_id'], 'litiges_demandeur_id_idx');
        await addIndexSafe('litiges', ['defenseur_id'], 'litiges_defenseur_id_idx');
        await addIndexSafe('litiges', ['statut'], 'litiges_statut_idx');
        await addIndexSafe('litige_evenements', ['litige_id'], 'litige_evenements_litige_id_idx');
        await addIndexSafe('tickets_sav', ['utilisateur_id'], 'tickets_sav_utilisateur_id_idx');
        await addIndexSafe('tickets_sav', ['commande_id'], 'tickets_sav_commande_id_idx');
        await addIndexSafe('guarantees', ['acheteur_id'], 'guarantees_acheteur_id_idx');
        await addIndexSafe('guarantees', ['commande_id'], 'guarantees_commande_id_idx');
        await addIndexSafe('interventions', ['technicien_id'], 'interventions_technicien_id_idx');
        await addIndexSafe('interventions', ['demandeur_id'], 'interventions_demandeur_id_idx');

        // ── Publicité & groupes d'achat ───────────────────────────────────
        await addIndexSafe('publicites', ['vendeur_id'], 'publicites_vendeur_id_idx');
        await addIndexSafe('publicites', ['statut'], 'publicites_statut_idx');
        await addIndexSafe('achats_groupes', ['organisateur_id'], 'achats_groupes_organisateur_id_idx');
        await addIndexSafe('achats_groupes_participants', ['achat_groupe_id'], 'achats_groupes_participants_achat_groupe_id_idx');
        await addIndexSafe('achats_groupes_participants', ['utilisateur_id'], 'achats_groupes_participants_utilisateur_id_idx');
        await addIndexSafe('certifications', ['fournisseur_id'], 'certifications_fournisseur_id_idx');

        // ── Nettoyage des contraintes uniques dupliquées ─────────────────
        await dropConstraintSafe('utilisateurs', 'utilisateurs_email_key1');
        await dropConstraintSafe('utilisateurs', 'utilisateurs_telephone_key1');
        await dropConstraintSafe('boutiques', 'boutiques_slug_key1');
    },

    down: async (queryInterface) => {
        const names = [
            ['commandes', 'commandes_utilisateur_id_idx'], ['commandes', 'commandes_transporteur_id_idx'], ['commandes', 'commandes_statut_idx'],
            ['details_commandes', 'details_commandes_commande_id_idx'], ['details_commandes', 'details_commandes_produit_id_idx'], ['details_commandes', 'details_commandes_fournisseur_id_idx'],
            ['produits', 'produits_boutique_id_idx'], ['produits', 'produits_categorie_id_idx'],
            ['images_produits', 'images_produits_produit_id_idx'],
            ['boutiques', 'boutiques_proprietaire_id_idx'], ['boutiques', 'boutiques_statut_idx'],
            ['reviews', 'reviews_produit_id_idx'], ['reviews', 'reviews_utilisateur_id_idx'],
            ['transactions', 'transactions_portefeuille_id_idx'], ['transactions', 'transactions_commande_id_idx'], ['transactions', 'transactions_statut_idx'],
            ['portefeuilles', 'portefeuilles_user_id_idx'],
            ['credits', 'credits_utilisateur_id_idx'], ['credits', 'credits_statut_idx'],
            ['echeanciers', 'echeanciers_credit_id_idx'],
            ['messages', 'messages_conversation_id_idx'], ['messages', 'messages_expediteur_id_idx'],
            ['conversation_participants', 'conversation_participants_user_id_idx'],
            ['notifications', 'notifications_utilisateur_id_idx'],
            ['litiges', 'litiges_commande_id_idx'], ['litiges', 'litiges_demandeur_id_idx'], ['litiges', 'litiges_defenseur_id_idx'], ['litiges', 'litiges_statut_idx'],
            ['litige_evenements', 'litige_evenements_litige_id_idx'],
            ['tickets_sav', 'tickets_sav_utilisateur_id_idx'], ['tickets_sav', 'tickets_sav_commande_id_idx'],
            ['guarantees', 'guarantees_acheteur_id_idx'], ['guarantees', 'guarantees_commande_id_idx'],
            ['interventions', 'interventions_technicien_id_idx'], ['interventions', 'interventions_demandeur_id_idx'],
            ['publicites', 'publicites_vendeur_id_idx'], ['publicites', 'publicites_statut_idx'],
            ['achats_groupes', 'achats_groupes_organisateur_id_idx'],
            ['achats_groupes_participants', 'achats_groupes_participants_achat_groupe_id_idx'], ['achats_groupes_participants', 'achats_groupes_participants_utilisateur_id_idx'],
            ['certifications', 'certifications_fournisseur_id_idx'],
        ];
        for (const [table, name] of names) {
            await queryInterface.removeIndex(table, name).catch(() => {});
        }
    },
};
