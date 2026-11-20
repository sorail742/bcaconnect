const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Devis soumis par un fournisseur en réponse à une RfqRequest.
 */
const RfqQuote = sequelize.define('RfqQuote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    demande_id: { type: DataTypes.UUID, allowNull: false },
    fournisseur_id: { type: DataTypes.UUID, allowNull: false },
    prix_unitaire: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    quantite_disponible: { type: DataTypes.INTEGER, allowNull: false },
    delai_livraison_jours: { type: DataTypes.INTEGER, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    statut: { type: DataTypes.STRING(20), defaultValue: 'en_attente' },
    // Somme (prix_unitaire × quantite_proposee) des RfqQuoteLine disponibles —
    // NULL pour un devis 'produit' classique (comparaison directe via prix_unitaire).
    montant_total: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
}, {
    tableName: 'devis_fournisseurs',
    underscored: true,
    timestamps: true,
    // Requis par RfqQuote.upsert({ conflictFields: ['demande_id', 'fournisseur_id'] })
    // (un fournisseur = un devis par demande) — absent jusqu'ici, ce qui faisait
    // échouer l'upsert avec une erreur SQL générique (aucun index correspondant
    // au conflictFields), bug latent jamais couvert par un test avant l'ajout
    // du devis projet multi-lignes (analyse concurrentielle #10).
    indexes: [{ unique: true, fields: ['demande_id', 'fournisseur_id'] }],
});

module.exports = RfqQuote;
