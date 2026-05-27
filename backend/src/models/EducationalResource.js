const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EducationalResource = sequelize.define('EducationalResource', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    titre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type_contenu: {
        type: DataTypes.ENUM('video', 'article', 'guide', 'pdf'),
        defaultValue: 'article',
    },
    url_contenu: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    audience_cible: {
        type: DataTypes.ENUM('tous', 'fournisseurs', 'clients', 'transporteurs'),
        defaultValue: 'tous',
    },
    tag: {
        type: DataTypes.STRING(100),
        allowNull: true,
    }
}, {
    tableName: 'educational_resources',
    underscored: true,
    timestamps: true,
});

module.exports = EducationalResource;
