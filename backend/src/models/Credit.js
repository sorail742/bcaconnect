const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Credit = sequelize.define('Credit', {
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
        allowNull: true, // Peut être lié à une commande spécifique ou être un crédit libre
    },
    montant_principal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    taux_interet: {
        type: DataTypes.FLOAT,
        defaultValue: 0, // En pourcentage
    },
    duree_mois: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ia_score_solvabilite: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    statut: {
        type: DataTypes.ENUM('en_attente', 'approuve', 'rejete', 'rembourse', 'defaut'),
        defaultValue: 'en_attente',
    },
    date_approbation: {
        type: DataTypes.DATE,
    },
    notes_admin: {
        type: DataTypes.TEXT,
    }
}, {
    tableName: 'credits',
    timestamps: true,
    underscored: true,
});

module.exports = Credit;
