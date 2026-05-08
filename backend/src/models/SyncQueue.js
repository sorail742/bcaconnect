const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SyncQueue = sequelize.define('SyncQueue', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type_donnee: {
        type: DataTypes.STRING(50),
    },
    payload: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    tentatives: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    statut_sync: {
        type: DataTypes.STRING(20),
        defaultValue: 'en_attente',
    },
    erreur_log: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'file_synchronisation',
    timestamps: true,
    underscored: true,
});

module.exports = SyncQueue;
