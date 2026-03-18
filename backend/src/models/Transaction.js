const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    montant: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    type_transaction: {
        type: DataTypes.STRING(50),
    },
    reference_externe: {
        type: DataTypes.STRING(100),
        unique: true,
    },
    cle_idempotence: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
    },
    statut: {
        type: DataTypes.ENUM('en_attente', 'reussi', 'echoue', 'annule'),
        defaultValue: 'en_attente'
    },
    ia_suspect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
}, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
});

module.exports = Transaction;
