const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // On pourrait ajouter des métadonnées comme le dernier message pour optimiser la liste
    dernier_message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    date_dernier_message: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'conversations',
    timestamps: true,
});

module.exports = Conversation;
