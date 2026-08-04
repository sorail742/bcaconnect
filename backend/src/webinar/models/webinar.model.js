const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Webinar = sequelize.define('Webinar', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    date_heure: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    intervenant: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categorie: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    statut: {
        type: DataTypes.ENUM('a_venir', 'en_direct', 'termine'),
        defaultValue: 'a_venir',
    },
    participants_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    lien_rejoindre: {
        type: DataTypes.STRING,
        allowNull: true, // Lien Teams, Zoom, etc.
    },
    video_url: {
        type: DataTypes.STRING,
        allowNull: true, // Lien du replay
    },
}, {
    tableName: 'webinaires',
    timestamps: true,
    underscored: true,
});

module.exports = Webinar;
