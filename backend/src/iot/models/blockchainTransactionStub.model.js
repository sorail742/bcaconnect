const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const BlockchainTransactionStub = sequelize.define('BlockchainTransactionStub', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    commande_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    hash_transaction: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    type_contrat: {
        type: DataTypes.ENUM('escrow', 'certificat_authenticite', 'transfert_propriete'),
        allowNull: false,
    },
    reseau: {
        type: DataTypes.STRING(50),
        defaultValue: 'polygon_amoy',
    },
    statut_onchain: {
        type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
        defaultValue: 'pending',
    }
}, {
    tableName: 'blockchain_transaction_stubs',
    underscored: true,
    timestamps: true,
});

module.exports = BlockchainTransactionStub;
