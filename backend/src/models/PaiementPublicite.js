const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaiementPublicite = sequelize.define('PaiementPublicite', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    publicite_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    utilisateur_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    montant: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    devise: {
        type: DataTypes.STRING,
        defaultValue: 'GNF'
    },
    statut: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    methode_paiement: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'paiements_publicites',
    timestamps: true
});

module.exports = PaiementPublicite;
