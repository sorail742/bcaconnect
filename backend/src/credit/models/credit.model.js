const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

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
    motif: {
        type: DataTypes.TEXT,
    },
    garanties: {
        type: DataTypes.TEXT,
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
    },
    statut: {
        type: DataTypes.STRING(32),
        defaultValue: 'en_attente',
    },
    // 'standard' (crédit classique, revue banque) ou 'micro' (micro-prêt
    // sous-bancarisé : petit montant, courte durée, approbation automatique
    // possible — voir microCreditService.js).
    type: {
        type: DataTypes.STRING(16),
        defaultValue: 'standard',
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
