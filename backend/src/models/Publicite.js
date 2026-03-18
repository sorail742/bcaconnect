const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Publicite = sequelize.define('Publicite', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contenu: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    url_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    url_destination: {
        type: DataTypes.STRING,
        allowNull: true
    },
    format: {
        type: DataTypes.ENUM('banner', 'popup', 'video', 'interstitial'),
        defaultValue: 'banner'
    },
    statut: {
        type: DataTypes.ENUM('active', 'paused', 'completed', 'pending_payment'),
        defaultValue: 'pending_payment'
    },
    budget_total: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0
    },
    budget_restant: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0
    },
    date_debut: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    vendeur_id: {
        type: DataTypes.UUID,
        allowNull: true // Null si c'est une pub admin
    }
}, {
    tableName: 'publicites',
    timestamps: true
});

module.exports = Publicite;
