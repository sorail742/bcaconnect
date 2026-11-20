const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Compte entreprise (analyse concurrentielle #2) — plusieurs utilisateurs
 * (membres) achètent au nom d'une même organisation, avec un plafond
 * d'auto-approbation : au-delà, un valideur doit approuver la commande
 * avant qu'elle ne soit réellement créée (voir organizationOrderRequest).
 */
const Organization = sequelize.define('Organization', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom: { type: DataTypes.STRING(150), allowNull: false },
    proprietaire_id: { type: DataTypes.UUID, allowNull: false },
    // NULL = toute commande d'un 'acheteur' nécessite une approbation.
    plafond_approbation_auto: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'organisations',
    underscored: true,
    timestamps: true,
});

module.exports = Organization;
