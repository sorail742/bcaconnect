const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Code promo — plateforme (boutique_id NULL, créé par un admin) ou boutique
 * (restreint aux produits d'un fournisseur donné).
 */
const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    createur_id: { type: DataTypes.UUID, allowNull: false },
    boutique_id: { type: DataTypes.UUID, allowNull: true },
    type: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'percentage' },
    valeur: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    montant_min: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    date_debut: { type: DataTypes.DATE, allowNull: true },
    date_fin: { type: DataTypes.DATE, allowNull: true },
    usage_max: { type: DataTypes.INTEGER, allowNull: true },
    usage_max_par_utilisateur: { type: DataTypes.INTEGER, defaultValue: 1 },
    usage_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'coupons',
    underscored: true,
    timestamps: true,
});

module.exports = Coupon;
