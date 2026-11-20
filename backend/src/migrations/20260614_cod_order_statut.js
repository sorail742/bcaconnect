'use strict';

/** Commandes COD : logistique autorisée avant encaissement (paiement à la livraison). */
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
            UPDATE commandes
            SET statut = 'en_préparation'
            WHERE methode_paiement = 'cod'
              AND statut = 'en_attente_paiement'
        `);

        await queryInterface.sequelize.query(`
            UPDATE commandes c
            SET statut_livraison = 'pret'
            WHERE c.statut_livraison = 'en_attente'
              AND EXISTS (SELECT 1 FROM details_commandes d WHERE d.commande_id = c.id)
              AND NOT EXISTS (
                SELECT 1 FROM details_commandes d
                WHERE d.commande_id = c.id
                  AND d.statut NOT IN ('prepare', 'livre')
              )
        `);
    },

    down: async () => {
        // Pas de retour arrière automatique
    },
};
