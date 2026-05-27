const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Intervention = sequelize.define('Intervention', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    guarantee_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    produit_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    demandeur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    technicien_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    description_probleme: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rapport_technique: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    cout_estime: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    status: {
        type: DataTypes.ENUM('en_attente', 'en_cours', 'resolu', 'rejete'),
        defaultValue: 'en_attente',
    }
}, {
    tableName: 'interventions',
    underscored: true,
    timestamps: true,
});

module.exports = Intervention;
