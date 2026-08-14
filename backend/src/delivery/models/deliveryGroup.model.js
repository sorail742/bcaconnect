const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const DeliveryGroup = sequelize.define('DeliveryGroup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    transporteur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    statut: {
        type: DataTypes.STRING(32),
        defaultValue: 'en_attente',
    },
    co2_saved: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    cost_saved: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    }
}, {
    tableName: 'delivery_groups',
    timestamps: true,
    underscored: true,
});

module.exports = DeliveryGroup;
