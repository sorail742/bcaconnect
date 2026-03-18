const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom_complet: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    mot_de_passe: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING(20),
        defaultValue: 'client',
    },
    score_confiance: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
    },
    est_approuve: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    statut: {
        type: DataTypes.STRING(20),
        defaultValue: 'en_attente',
    },
    derniere_synchro: {
        type: DataTypes.DATE,
    },
    metadata_securite: {
        type: DataTypes.JSONB,
    },
    preferences_ia: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'utilisateurs',
});

module.exports = User;
