const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    utilisateur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    commande_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    sujet: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    priorite: {
        type: DataTypes.STRING(32),
        defaultValue: 'moyenne',
    },
    statut: {
        type: DataTypes.STRING(32),
        defaultValue: 'ouvert',
    },
    type_sav: {
        type: DataTypes.STRING(32),
        defaultValue: 'assistance',
    },
    assigne_a: {
        type: DataTypes.UUID, // ID d'un technicien ou admin
        allowNull: true,
    }
}, {
    tableName: 'tickets_sav',
    timestamps: true,
    underscored: true,
});

module.exports = Ticket;
