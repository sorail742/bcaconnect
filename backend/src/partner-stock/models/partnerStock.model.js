const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Stock détenu par un tiers pour un produit donné (cahier des charges
 * 2.5) — distinct de Product.stock_quantite (stock propre au vendeur sur
 * la plateforme). type_stock distingue le mode de détention :
 * - consigne       : stock chez le vendeur mais appartenant à un fournisseur tiers
 * - entrepot_tiers : stock physiquement hébergé dans un entrepôt externe
 * - dropshipping   : jamais détenu par le vendeur, expédié directement par le tiers
 */
const PartnerStock = sequelize.define('PartnerStock', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    produit_id: { type: DataTypes.UUID, allowNull: false },
    partenaire_nom: { type: DataTypes.STRING(150), allowNull: false },
    partenaire_contact: { type: DataTypes.STRING(150), allowNull: true },
    type_stock: {
        type: DataTypes.ENUM('consigne', 'entrepot_tiers', 'dropshipping'),
        allowNull: false,
        defaultValue: 'entrepot_tiers',
    },
    quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    localisation: { type: DataTypes.STRING(200), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    derniere_synchro: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'stocks_partenaires',
    underscored: true,
    timestamps: true,
});

module.exports = PartnerStock;
