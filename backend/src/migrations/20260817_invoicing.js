'use strict';

/**
 * Facturation électronique conforme (Code Général des Impôts Guinée,
 * analyse concurrentielle #3) — identité fiscale vendeur + factures
 * légales numérotées séquentiellement sans trou (exigence CGI/audit).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const storeTable = await queryInterface.describeTable('boutiques');
        if (!storeTable.nif) {
            await queryInterface.addColumn('boutiques', 'nif', { type: Sequelize.STRING(50), allowNull: true });
        }
        if (!storeTable.rccm) {
            await queryInterface.addColumn('boutiques', 'rccm', { type: Sequelize.STRING(50), allowNull: true });
        }

        if (!(await queryInterface.describeTable('compteurs_facture').catch(() => null))) {
            await queryInterface.createTable('compteurs_facture', {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                dernier_numero: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            });
            // Ligne unique verrouillée (SELECT ... FOR UPDATE) à chaque émission —
            // garantit une numérotation strictement séquentielle sans trou.
            await queryInterface.bulkInsert('compteurs_facture', [{ dernier_numero: 0 }]);
        }

        if (!(await queryInterface.describeTable('factures').catch(() => null))) {
            await queryInterface.createTable('factures', {
                id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
                numero: { type: Sequelize.STRING(30), allowNull: false, unique: true },
                commande_id: {
                    type: Sequelize.UUID, allowNull: false,
                    references: { model: 'commandes', key: 'id' }, onDelete: 'RESTRICT',
                },
                boutique_id: {
                    type: Sequelize.UUID, allowNull: false,
                    references: { model: 'boutiques', key: 'id' }, onDelete: 'RESTRICT',
                },
                utilisateur_id: {
                    type: Sequelize.UUID, allowNull: false,
                    references: { model: 'utilisateurs', key: 'id' }, onDelete: 'RESTRICT',
                },
                acheteur_nif: { type: Sequelize.STRING(50), allowNull: true },
                montant_ht: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
                taux_tva: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 18.00 },
                montant_tva: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
                montant_ttc: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
                date_emission: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('factures', ['boutique_id'], { name: 'factures_boutique_idx' });
            await queryInterface.addIndex('factures', ['utilisateur_id'], { name: 'factures_utilisateur_idx' });
            // Une facture par (commande, boutique) — un vendeur ne peut être
            // facturé qu'une fois pour ses articles d'une même commande.
            await queryInterface.addIndex('factures', ['commande_id', 'boutique_id'], {
                unique: true, name: 'factures_commande_boutique_unique',
            });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('factures').catch(() => {});
        await queryInterface.dropTable('compteurs_facture').catch(() => {});
        await queryInterface.removeColumn('boutiques', 'rccm').catch(() => {});
        await queryInterface.removeColumn('boutiques', 'nif').catch(() => {});
    },
};
