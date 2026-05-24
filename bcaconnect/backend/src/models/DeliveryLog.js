const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryLog = sequelize.define('DeliveryLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    statut: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    commentaire: {
        type: DataTypes.TEXT,
    }
}, {
    tableName: 'delivery_logs',
    timestamps: true,
    underscored: true,
});

module.exports = DeliveryLog;
