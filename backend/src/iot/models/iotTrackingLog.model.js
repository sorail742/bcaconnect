const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const IoTTrackingLog = sequelize.define('IoTTrackingLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    commande_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
    temperature_celsius: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    humidite_pourcentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    statut: {
        type: DataTypes.STRING(50),
        defaultValue: 'en_transit',
    },
    timestamp_appareil: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'iot_tracking_logs',
    underscored: true,
    timestamps: true,
});

module.exports = IoTTrackingLog;
