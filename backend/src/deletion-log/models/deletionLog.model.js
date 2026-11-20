const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Historique infini des suppressions. Aucune ligne n'est jamais retirée de
 * cette table : chaque suppression réelle ailleurs sur la plateforme doit
 * d'abord y déposer un instantané complet (preuve), consultable par un admin
 * même si l'enregistrement d'origine (et son auteur) a depuis disparu.
 */
const DeletionLog = sequelize.define('DeletionLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    table_affectee: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    id_enregistrement: {
        type: DataTypes.STRING(100),
    },
    libelle: {
        type: DataTypes.STRING(255),
    },
    snapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    supprime_par: {
        type: DataTypes.UUID,
    },
    // Copie figée de l'identité de l'auteur : reste lisible même si ce
    // compte est lui-même supprimé plus tard.
    supprime_par_nom: {
        type: DataTypes.STRING(255),
    },
    confirmation_saisie: {
        type: DataTypes.STRING(255),
    },
    adresse_ip: {
        type: DataTypes.STRING(45),
    },
    agent_utilisateur: {
        type: DataTypes.TEXT,
    },
    restaure: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    restaure_le: {
        type: DataTypes.DATE,
    },
    restaure_par: {
        type: DataTypes.UUID,
    },
}, {
    tableName: 'deletion_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
});

module.exports = DeletionLog;
