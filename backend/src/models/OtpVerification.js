const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtpVerification = sequelize.define('OtpVerification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    type_action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'inscription | paiement | retrait',
    },
    expire_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    est_utilise: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'verifications_otp',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = OtpVerification;
