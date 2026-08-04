const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const LitigeEvenement = sequelize.define('LitigeEvenement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    litige_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    auteur_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(40),
        allowNull: false,
        comment: 'ouverture | reponse_defenseur | proposition_ia | acceptation | escalade | changement_statut | resolution',
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    meta: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON optionnel (statut, montant, etc.)',
    },
}, {
    tableName: 'litige_evenements',
    underscored: true,
});

module.exports = LitigeEvenement;
