const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Question publique sur un produit (style Amazon Q&A). `reponse` reste NULL
 * tant que le fournisseur (ou l'admin) n'a pas répondu.
 */
const ProductQuestion = sequelize.define('ProductQuestion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    produit_id: { type: DataTypes.UUID, allowNull: false },
    utilisateur_id: { type: DataTypes.UUID, allowNull: false },
    question: { type: DataTypes.TEXT, allowNull: false },
    reponse: { type: DataTypes.TEXT, allowNull: true },
    repondu_par: { type: DataTypes.UUID, allowNull: true },
    repondu_at: { type: DataTypes.DATE, allowNull: true },
    utile_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    visible: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'questions_produits',
    underscored: true,
    timestamps: true,
});

module.exports = ProductQuestion;
