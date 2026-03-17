const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom_produit: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    prix_unitaire: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    stock_quantite: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    prix_ancien: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    preferences_ia: {
        type: DataTypes.JSONB,
    },
    est_local: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'produits',
});

module.exports = Product;
