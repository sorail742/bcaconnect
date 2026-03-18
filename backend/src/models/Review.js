const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    utilisateur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    produit_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    commande_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    note: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    commentaire: {
        type: DataTypes.TEXT,
    },
    ia_sentiment: {
        type: DataTypes.ENUM('positif', 'neutre', 'negatif'),
        defaultValue: 'neutre',
    },
    est_approuve: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
});

module.exports = Review;
