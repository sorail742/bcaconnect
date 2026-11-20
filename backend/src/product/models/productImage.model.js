const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/** Galerie multi-images d'un produit (style Alibaba) — Product.image_url reste la
 * couverture (première image) pour compatibilité avec le reste de l'app. */
const ProductImage = sequelize.define('ProductImage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    produit_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    url_image: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    ordre: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'images_produits',
    underscored: true,
    timestamps: true,
});

module.exports = ProductImage;
