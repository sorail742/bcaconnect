const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Demande de devis (RFQ) — un acheteur publie un besoin (produit/quantité),
 * les fournisseurs répondent avec un RfqQuote. Feature B2B standard des
 * grandes marketplaces (Alibaba), absente du cahier des charges initial.
 */
const RfqRequest = sequelize.define('RfqRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    utilisateur_id: { type: DataTypes.UUID, allowNull: false },
    categorie_id: { type: DataTypes.UUID, allowNull: true },
    titre: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    quantite: { type: DataTypes.INTEGER, allowNull: false },
    unite: { type: DataTypes.STRING(30), defaultValue: 'unités' },
    budget_max: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    ville_livraison: { type: DataTypes.STRING(100), allowNull: true },
    date_limite: { type: DataTypes.DATE, allowNull: true },
    statut: { type: DataTypes.STRING(20), defaultValue: 'ouverte' },
    devis_accepte_id: { type: DataTypes.UUID, allowNull: true },
}, {
    tableName: 'demandes_devis',
    underscored: true,
    timestamps: true,
});

module.exports = RfqRequest;
