const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AchatGroupe = sequelize.define('AchatGroupe', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    organisateur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    produit_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    titre: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    quantite_cible: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantite_actuelle: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    prix_unitaire_groupe: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    prix_unitaire_normal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    remise_pct: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    date_limite: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    zone_livraison: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    type_organisateur: {
        type: DataTypes.ENUM('ong', 'pme', 'institution', 'particulier', 'autre'),
        defaultValue: 'particulier',
    },
    statut: {
        type: DataTypes.ENUM('ouvert', 'atteint', 'cloture', 'annule'),
        defaultValue: 'ouvert',
    },
}, {
    tableName: 'achats_groupes',
    underscored: true,
});

module.exports = AchatGroupe;
