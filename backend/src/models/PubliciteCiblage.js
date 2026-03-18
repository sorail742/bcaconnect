const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PubliciteCiblage = sequelize.define('PubliciteCiblage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    publicite_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    role_cible: {
        type: DataTypes.STRING, // 'admin', 'vendor', 'delivery', 'client', 'all'
        defaultValue: 'all'
    },
    localisation: {
        type: DataTypes.STRING, // Ville ou Région
        allowNull: true
    },
    preferences_cle: {
        type: DataTypes.JSONB, // Tags ou centres d'intérêt
        allowNull: true
    }
}, {
    tableName: 'ciblage_publicites',
    timestamps: true
});

module.exports = PubliciteCiblage;
