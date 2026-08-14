const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Facture légale (Code Général des Impôts Guinée, analyse concurrentielle
 * #3) — une facture par (commande, boutique) : une commande multi-vendeurs
 * produit une facture par vendeur, chacune ne portant que ses propres
 * articles/NIF/RCCM. Une facture émise ne se régénère jamais avec un
 * nouveau numéro. `numero` est attribué séquentiellement sans trou par
 * invoiceCounter.model.js, sous verrou transactionnel.
 */
const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    numero: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    commande_id: { type: DataTypes.UUID, allowNull: false },
    boutique_id: { type: DataTypes.UUID, allowNull: false },
    utilisateur_id: { type: DataTypes.UUID, allowNull: false },
    // Optionnel : NIF de l'acheteur (B2B), fourni au moment de l'émission —
    // la plupart des clients particuliers n'en ont pas.
    acheteur_nif: { type: DataTypes.STRING(50), allowNull: true },
    montant_ht: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    taux_tva: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 18.00 },
    montant_tva: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    montant_ttc: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    date_emission: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
    tableName: 'factures',
    underscored: true,
    timestamps: true,
    indexes: [
        { unique: true, fields: ['commande_id', 'boutique_id'], name: 'factures_commande_boutique_unique' },
    ],
});

module.exports = Invoice;
