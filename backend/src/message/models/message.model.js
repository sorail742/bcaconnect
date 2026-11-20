const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

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
            isIn: [['text', 'image', 'file', 'audio', 'video', 'product']]
        }
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
