const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Réponse d'un fournisseur à une ligne précise d'un appel d'offres projet.
 */
const RfqQuoteLine = sequelize.define('RfqQuoteLine', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    devis_id: { type: DataTypes.UUID, allowNull: false },
    ligne_id: { type: DataTypes.UUID, allowNull: false },
    prix_unitaire: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    quantite_proposee: { type: DataTypes.INTEGER, allowNull: true },
    disponible: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'devis_fournisseurs_lignes',
    underscored: true,
    timestamps: true,
});

module.exports = RfqQuoteLine;
