const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom_boutique: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    slug: {
        type: DataTypes.STRING(150),
        unique: true,
    },
    statut: {
        type: DataTypes.STRING(20),
        defaultValue: 'actif',
    },
    email_boutique: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    telephone_boutique: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: 'boutiques',
});

module.exports = Store;
