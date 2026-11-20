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
    // Lecture hors de la plage [iot_temp_min, iot_temp_max] configurée sur
    // la commande — déclenche une alerte edge-triggered (voir iot.service.js).
    hors_seuil: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
