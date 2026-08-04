const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Variante d'un produit (ex. "Rouge / L"). `prix_unitaire` NULL = hérite du
 * prix du produit parent. `attributs` : objet libre { taille: 'L', couleur: 'Rouge' }.
 */
const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    produit_id: { type: DataTypes.UUID, allowNull: false },
    nom_variante: { type: DataTypes.STRING(150), allowNull: false },
    attributs: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    prix_unitaire: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    stock_quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    sku: { type: DataTypes.STRING(60), allowNull: true },
    image_url: { type: DataTypes.TEXT, allowNull: true },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'produit_variantes',
    underscored: true,
    timestamps: true,
});

module.exports = ProductVariant;
