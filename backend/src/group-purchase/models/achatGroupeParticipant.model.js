const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AchatGroupeParticipant = sequelize.define('AchatGroupeParticipant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    achat_groupe_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    utilisateur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    montant_total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    statut: {
        type: DataTypes.ENUM('engage', 'confirme', 'annule'),
        defaultValue: 'engage',
    },
    commande_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
}, {
    tableName: 'achats_groupes_participants',
    underscored: true,
});

module.exports = AchatGroupeParticipant;
