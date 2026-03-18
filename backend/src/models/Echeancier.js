const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Echeancier = sequelize.define('Echeancier', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    credit_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    date_echeance: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    montant_du: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    montant_paye: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    statut: {
        type: DataTypes.ENUM('du', 'paye', 'en_retard', 'annule'),
        defaultValue: 'du',
    },
    reference_paiement: {
        type: DataTypes.STRING(100),
    }
}, {
    tableName: 'echeanciers',
    timestamps: true,
    underscored: true,
});

module.exports = Echeancier;
