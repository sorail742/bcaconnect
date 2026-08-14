'use strict';

/**
 * Système RFQ (Request for Quotation / "Demande de devis") — feature B2B
 * standard des grandes marketplaces (Alibaba), absente du cahier des charges
 * initial. Un acheteur publie un besoin, plusieurs fournisseurs répondent par
 * un devis, l'acheteur compare et accepte celui qu'il préfère.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const reqTable = await queryInterface.describeTable('demandes_devis').catch(() => null);
        if (!reqTable) {
            await queryInterface.createTable('demandes_devis', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                utilisateur_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                categorie_id: {
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: { model: 'categories', key: 'id' },
                    onDelete: 'SET NULL',
                },
                titre: { type: Sequelize.STRING(150), allowNull: false },
                description: { type: Sequelize.TEXT, allowNull: false },
                quantite: { type: Sequelize.INTEGER, allowNull: false },
                unite: { type: Sequelize.STRING(30), defaultValue: 'unités' },
                budget_max: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
                ville_livraison: { type: Sequelize.STRING(100), allowNull: true },
                date_limite: { type: Sequelize.DATE, allowNull: true },
                statut: { type: Sequelize.STRING(20), defaultValue: 'ouverte' }, // ouverte | attribuee | fermee | annulee
                devis_accepte_id: { type: Sequelize.UUID, allowNull: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('demandes_devis', ['utilisateur_id'], { name: 'demandes_devis_user_idx' });
            await queryInterface.addIndex('demandes_devis', ['statut'], { name: 'demandes_devis_statut_idx' });
            await queryInterface.addIndex('demandes_devis', ['categorie_id'], { name: 'demandes_devis_categorie_idx' });
        }

        const quoteTable = await queryInterface.describeTable('devis_fournisseurs').catch(() => null);
        if (!quoteTable) {
            await queryInterface.createTable('devis_fournisseurs', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                demande_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'demandes_devis', key: 'id' },
                    onDelete: 'CASCADE',
                },
                fournisseur_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' },
                    onDelete: 'CASCADE',
                },
                prix_unitaire: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
                quantite_disponible: { type: Sequelize.INTEGER, allowNull: false },
                delai_livraison_jours: { type: Sequelize.INTEGER, allowNull: true },
                message: { type: Sequelize.TEXT, allowNull: true },
                statut: { type: Sequelize.STRING(20), defaultValue: 'en_attente' }, // en_attente | accepte | refuse
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addConstraint('devis_fournisseurs', {
                fields: ['demande_id', 'fournisseur_id'],
                type: 'unique',
                name: 'devis_fournisseurs_demande_fournisseur_unique',
            });
            await queryInterface.addIndex('devis_fournisseurs', ['demande_id'], { name: 'devis_fournisseurs_demande_idx' });
            await queryInterface.addIndex('devis_fournisseurs', ['fournisseur_id'], { name: 'devis_fournisseurs_fournisseur_idx' });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('devis_fournisseurs').catch(() => {});
        await queryInterface.dropTable('demandes_devis').catch(() => {});
    },
};
