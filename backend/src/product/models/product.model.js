const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

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
        type: DataTypes.JSON,
    },
    boutique_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    categorie_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    ia_recommandations: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    est_local: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    condition: {
        type: DataTypes.ENUM('neuf', 'occasion', 'reconditionne'),
        defaultValue: 'neuf',
    },
    marque: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    unite_mesure: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Pièce',
    },
    mots_cles: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    has_variants: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'produits',
    underscored: true,
    timestamps: true,
});

module.exports = Product;
