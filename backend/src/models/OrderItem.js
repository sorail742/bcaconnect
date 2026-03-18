const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    prix_unitaire_achat: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    statut: {
        type: DataTypes.ENUM('en_attente', 'préparation', 'expédié', 'annulé'),
        defaultValue: 'en_attente',
    },
}, {
    tableName: 'details_commandes',
    timestamps: true,
    underscored: true,
});

module.exports = OrderItem;
