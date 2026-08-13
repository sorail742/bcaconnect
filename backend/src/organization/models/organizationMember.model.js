const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Membre d'un compte entreprise. 'acheteur' déclenche une approbation
 * au-delà du plafond ; 'valideur'/'admin' approuvent et achètent sans limite.
 */
const OrganizationMember = sequelize.define('OrganizationMember', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    organization_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    role: {
        type: DataTypes.ENUM('acheteur', 'valideur', 'admin'),
        allowNull: false,
        defaultValue: 'acheteur',
    },
}, {
    tableName: 'organisation_membres',
    underscored: true,
    timestamps: true,
    indexes: [{ unique: true, fields: ['organization_id', 'user_id'] }],
});

module.exports = OrganizationMember;
