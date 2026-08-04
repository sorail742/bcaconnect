const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Guarantee = sequelize.define('Guarantee', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    produit_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    acheteur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    commande_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    duree_mois: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 12,
    },
    date_debut: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    date_fin: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'expiree', 'annulee'),
        defaultValue: 'active',
    },
    conditions: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'guarantees',
    underscored: true,
    timestamps: true,
});

module.exports = Guarantee;
