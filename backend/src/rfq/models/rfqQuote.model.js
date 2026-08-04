const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Devis soumis par un fournisseur en réponse à une RfqRequest.
 */
const RfqQuote = sequelize.define('RfqQuote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    demande_id: { type: DataTypes.UUID, allowNull: false },
    fournisseur_id: { type: DataTypes.UUID, allowNull: false },
    prix_unitaire: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    quantite_disponible: { type: DataTypes.INTEGER, allowNull: false },
    delai_livraison_jours: { type: DataTypes.INTEGER, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    statut: { type: DataTypes.STRING(20), defaultValue: 'en_attente' },
}, {
    tableName: 'devis_fournisseurs',
    underscored: true,
    timestamps: true,
});

module.exports = RfqQuote;
