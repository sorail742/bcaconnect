'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('achats_groupes', {
            id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
            organisateur_id: { type: Sequelize.UUID, allowNull: false },
            produit_id: { type: Sequelize.UUID, allowNull: false },
            titre: { type: Sequelize.STRING(200), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            quantite_cible: { type: Sequelize.INTEGER, allowNull: false },
            quantite_actuelle: { type: Sequelize.INTEGER, defaultValue: 0 },
            prix_unitaire_groupe: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            prix_unitaire_normal: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            remise_pct: { type: Sequelize.FLOAT, defaultValue: 0 },
            date_limite: { type: Sequelize.DATE, allowNull: false },
            zone_livraison: { type: Sequelize.STRING(150), allowNull: true },
            type_organisateur: {
                type: Sequelize.STRING(20),
                defaultValue: 'particulier',
            },
            statut: {
                type: Sequelize.STRING(20),
                defaultValue: 'ouvert',
            },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false },
        }).catch(() => {});

        await queryInterface.createTable('achats_groupes_participants', {
            id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
            achat_groupe_id: { type: Sequelize.UUID, allowNull: false },
            utilisateur_id: { type: Sequelize.UUID, allowNull: false },
            quantite: { type: Sequelize.INTEGER, allowNull: false },
            montant_total: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            statut: { type: Sequelize.STRING(20), defaultValue: 'engage' },
            commande_id: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false },
        }).catch(() => {});
    },
};
