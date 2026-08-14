const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AiConversation = sequelize.define('AiConversation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true, // null pour les échanges en mode invité
    },
    titre: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
}, {
    tableName: 'ai_conversations',
    timestamps: true,
    underscored: true,
});

module.exports = AiConversation;
