const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Suivi de progression d'un utilisateur sur une ressource BCA Academy —
 * consultation simple ou réussite/échec de quiz (cahier des charges 3.14).
 */
const EducationalProgress = sequelize.define('EducationalProgress', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    utilisateur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    resource_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    statut: {
        type: DataTypes.STRING(20),
        defaultValue: 'vu',
        validate: { isIn: [['vu', 'quiz_reussi', 'quiz_echoue']] },
    },
    quiz_score: {
        type: DataTypes.INTEGER, // pourcentage
        allowNull: true,
    },
    tentatives: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'educational_progress',
    underscored: true,
    timestamps: true,
    indexes: [
        { unique: true, fields: ['utilisateur_id', 'resource_id'] },
    ],
});

module.exports = EducationalProgress;
