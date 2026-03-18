const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    total_ttc: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    statut: {
        type: DataTypes.STRING(32),
        defaultValue: 'payé',
    },
    mode_resilience: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    cle_idempotence: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
    },
    signature_offline: {
        type: DataTypes.TEXT,
    },
    statut_livraison: {
        type: DataTypes.STRING(32),
        defaultValue: 'en_attente',
    },
    transporteur_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    delivery_otp: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    nom_destinataire: {
        type: DataTypes.STRING(150),
        allowNull: true, // Pourrait être null si on utilise les infos du compte par défaut
    },
    telephone_livraison: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    adresse_livraison: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    date_commande: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'commandes',
    timestamps: true,
    underscored: true,
});

module.exports = Order;
