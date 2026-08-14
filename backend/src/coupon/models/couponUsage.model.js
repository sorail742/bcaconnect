const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CouponUsage = sequelize.define('CouponUsage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    coupon_id: { type: DataTypes.UUID, allowNull: false },
    utilisateur_id: { type: DataTypes.UUID, allowNull: false },
    commande_id: { type: DataTypes.UUID, allowNull: true },
    montant_reduction: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
}, {
    tableName: 'coupon_usages',
    underscored: true,
    timestamps: true,
});

module.exports = CouponUsage;
