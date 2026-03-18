const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Litige = sequelize.define('Litige', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    commande_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    demandeur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    defenseur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('livraison', 'qualite', 'paiement', 'autre'),
        defaultValue: 'autre',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    statut: {
        type: DataTypes.ENUM('ouvert', 'mediation', 'resolu', 'escalade', 'annule'),
        defaultValue: 'ouvert',
    },
    solution_proposee_ia: {
        type: DataTypes.TEXT,
    },
    decision_finale: {
        type: DataTypes.TEXT,
    },
    ia_score_gravite: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    }
}, {
    tableName: 'litiges',
    timestamps: true,
    underscored: true,
});

module.exports = Litige;
