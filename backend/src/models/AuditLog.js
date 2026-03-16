const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    table_affectee: {
        type: DataTypes.STRING(50),
    },
    id_enregistrement: {
        type: DataTypes.UUID,
    },
    adresse_ip: {
        type: DataTypes.STRING(45),
    },
    agent_utilisateur: {
        type: DataTypes.TEXT,
    },
    niveau_alerte: {
        type: DataTypes.STRING(10),
        defaultValue: 'info',
    },
}, {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
});

module.exports = AuditLog;
