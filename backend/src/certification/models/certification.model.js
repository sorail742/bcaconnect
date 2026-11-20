const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Certification = sequelize.define('Certification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    fournisseur_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Ex: Registre de commerce, Certification qualité, Attestation fiscale',
    },
    document_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    statut: {
        type: DataTypes.STRING(20),
        defaultValue: 'en_attente',
        validate: {
            isIn: [['en_attente', 'validee', 'rejetee']]
        }
    },
    commentaire_admin: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    date_expiration: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    tableName: 'certifications',
    timestamps: true,
    underscored: true,
});

module.exports = Certification;
