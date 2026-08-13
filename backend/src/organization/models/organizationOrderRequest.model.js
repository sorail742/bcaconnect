const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Demande d'achat en attente d'approbation. `payload` contient exactement
 * le corps attendu par orderService.create() (items, deliveryInfo,
 * paymentMethod, ...) — la commande réelle n'est créée (via le flux
 * existant, inchangé) qu'au moment de l'approbation.
 */
const OrganizationOrderRequest = sequelize.define('OrganizationOrderRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    organization_id: { type: DataTypes.UUID, allowNull: false },
    demandeur_id: { type: DataTypes.UUID, allowNull: false },
    payload: { type: DataTypes.JSON, allowNull: false },
    montant_estime: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    statut: {
        type: DataTypes.ENUM('en_attente', 'approuvee', 'rejetee'),
        allowNull: false,
        defaultValue: 'en_attente',
    },
    traite_par_id: { type: DataTypes.UUID, allowNull: true },
    commentaire: { type: DataTypes.TEXT, allowNull: true },
    commande_id: { type: DataTypes.UUID, allowNull: true },
}, {
    tableName: 'organisation_demandes_achat',
    underscored: true,
    timestamps: true,
});

module.exports = OrganizationOrderRequest;
