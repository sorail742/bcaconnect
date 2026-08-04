const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AiMessage = sequelize.define('AiMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    conversation_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: [['user', 'assistant']]
        }
    },
    contenu: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'ai_messages',
    timestamps: true,
    underscored: true,
});

module.exports = AiMessage;
