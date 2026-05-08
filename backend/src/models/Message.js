const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    conversation_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    expediteur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    contenu: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(10),
        defaultValue: 'text',
        validate: {
            isIn: [['text', 'image', 'file']]
        }
    },
    est_lu: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    }
}, {
    tableName: 'messages',
    timestamps: true,
});

module.exports = Message;
