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
}, {
    tableName: 'boutiques',
});

module.exports = Store;
