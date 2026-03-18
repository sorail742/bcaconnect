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
        type: DataTypes.ENUM('payé', 'annulé', 'retourné'),
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
        type: DataTypes.ENUM('en_attente', 'pret', 'ramasse', 'en_cours', 'livre'),
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
