'use strict';

/**
 * Appel d'offres projet multi-lignes (analyse concurrentielle #10) — étend
 * le RFQ mono-produit existant sans le modifier (type_demande='produit'
 * reste le comportement historique inchangé).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const demandesTable = await queryInterface.describeTable('demandes_devis');
        if (!demandesTable.type_demande) {
            await queryInterface.addColumn('demandes_devis', 'type_demande', {
                type: Sequelize.STRING(20), allowNull: false, defaultValue: 'produit',
            });
        }
        if (demandesTable.quantite && demandesTable.quantite.allowNull === false) {
            await queryInterface.changeColumn('demandes_devis', 'quantite', {
                type: Sequelize.INTEGER, allowNull: true,
            });
        }

        const devisTable = await queryInterface.describeTable('devis_fournisseurs');
        if (!devisTable.montant_total) {
            await queryInterface.addColumn('devis_fournisseurs', 'montant_total', {
                type: Sequelize.DECIMAL(15, 2), allowNull: true,
            });
        }
        // Index unique requis par RfqQuote.upsert({conflictFields: [...]}) — absent
        // jusqu'ici (bug latent préexistant, voir rfqQuote.model.js).
        try {
            await queryInterface.addIndex('devis_fournisseurs', ['demande_id', 'fournisseur_id'], {
                unique: true, name: 'devis_fournisseurs_demande_fournisseur_unique',
            });
        } catch (err) {
            if (!/already exists|duplicate/i.test(err.message)) throw err;
        }

        if (!(await queryInterface.describeTable('demandes_devis_lignes').catch(() => null))) {
            await queryInterface.createTable('demandes_devis_lignes', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                demande_id: {
                    type: Sequelize.UUID, allowNull: false,
                    references: { model: 'demandes_devis', key: 'id' }, onDelete: 'CASCADE',
                },
                description: { type: Sequelize.STRING(255), allowNull: false },
                quantite: { type: Sequelize.INTEGER, allowNull: false },
                unite: { type: Sequelize.STRING(30), defaultValue: 'unités' },
                ordre: { type: Sequelize.INTEGER, defaultValue: 0 },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('demandes_devis_lignes', ['demande_id'], { name: 'demandes_devis_lignes_demande_idx' });
        }

        if (!(await queryInterface.describeTable('devis_fournisseurs_lignes').catch(() => null))) {
            await queryInterface.createTable('devis_fournisseurs_lignes', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                devis_id: {
                    type: Sequelize.UUID, allowNull: false,
                    references: { model: 'devis_fournisseurs', key: 'id' }, onDelete: 'CASCADE',
                },
                ligne_id: {
                    type: Sequelize.UUID, allowNull: false,
                    references: { model: 'demandes_devis_lignes', key: 'id' }, onDelete: 'CASCADE',
                },
                prix_unitaire: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
                quantite_proposee: { type: Sequelize.INTEGER, allowNull: true },
                disponible: { type: Sequelize.BOOLEAN, defaultValue: true },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('devis_fournisseurs_lignes', ['devis_id'], { name: 'devis_fournisseurs_lignes_devis_idx' });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('devis_fournisseurs_lignes').catch(() => {});
        await queryInterface.dropTable('demandes_devis_lignes').catch(() => {});
        await queryInterface.removeColumn('devis_fournisseurs', 'montant_total').catch(() => {});
        await queryInterface.removeColumn('demandes_devis', 'type_demande').catch(() => {});
    },
};
