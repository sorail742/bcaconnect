const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PubliciteStat = sequelize.define('PubliciteStat', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    publicite_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    impressions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    clics: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    conversions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    date_stat: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'statistiques_publicites',
    timestamps: true
});

module.exports = PubliciteStat;
