const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Ligne d'un appel d'offres projet (analyse concurrentielle #10) — une
 * RfqRequest de type 'projet' contient plusieurs lignes (bill of materials
 * d'un chantier), contrairement au type 'produit' (un seul article, flux
 * existant inchangé).
 */
const RfqLineItem = sequelize.define('RfqLineItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    demande_id: { type: DataTypes.UUID, allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: false },
    quantite: { type: DataTypes.INTEGER, allowNull: false },
    unite: { type: DataTypes.STRING(30), defaultValue: 'unités' },
    ordre: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    tableName: 'demandes_devis_lignes',
    underscored: true,
    timestamps: true,
});

module.exports = RfqLineItem;
