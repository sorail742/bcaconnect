const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define('Wallet', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    solde_virtuel: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    solde_sequestre: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
}, {
    tableName: 'portefeuilles',
});

module.exports = Wallet;
