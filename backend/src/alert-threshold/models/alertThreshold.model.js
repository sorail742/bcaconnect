const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Seuil d'alerte dynamique défini par un utilisateur sur un produit (cahier
 * des charges 3.6) — évalué périodiquement par alertThresholdCron pour
 * générer une Notification quand la condition (prix ou stock) est atteinte.
 */
const AlertThreshold = sequelize.define('AlertThreshold', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    utilisateur_id: { type: DataTypes.UUID, allowNull: false },
    produit_id: { type: DataTypes.UUID, allowNull: false },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { isIn: [['prix_produit', 'stock_produit']] },
    },
    operateur: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'inferieur_egal',
        validate: { isIn: [['inferieur_egal', 'superieur_egal']] },
    },
    valeur_seuil: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
    dernier_declenchement: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'seuils_alerte',
    underscored: true,
    timestamps: true,
    indexes: [
        { unique: true, fields: ['utilisateur_id', 'produit_id', 'type'], name: 'seuils_alerte_user_produit_type_unique' },
    ],
});

module.exports = AlertThreshold;
