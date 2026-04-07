const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const encryptionService = require('../utils/encryptionService');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom_complet: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    telephone: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    mot_de_passe: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'fournisseur', 'transporteur', 'client', 'banque'),
        defaultValue: 'client',
        allowNull: false,
    },
    score_confiance: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
    },
    est_approuve: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    statut: {
        type: DataTypes.STRING(20),
        defaultValue: 'en_attente',
    },
    // Chiffres de Sécurité Avancés (Standard BCA v2.5)
    two_factor_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    two_factor_secret: {
        type: DataTypes.STRING(200), // Sera chiffré par le hook
        allowNull: true,
    },
    two_factor_backup_codes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    derniere_synchro: {
        type: DataTypes.DATE,
    },
    metadata_securite: {
        type: DataTypes.JSON,
    },
    preferences_ia: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'utilisateurs',
    hooks: {
        beforeSave: (user) => {
            // Chiffrement données sensibles
            if (user.telephone && !user.telephone.includes(':')) {
                user.telephone = encryptionService.encrypt(user.telephone);
            }
            if (user.two_factor_secret && !user.two_factor_secret.includes(':')) {
                user.two_factor_secret = encryptionService.encrypt(user.two_factor_secret);
            }
        },
        afterFind: (users) => {
            if (!users) return;
            const decryptUser = (u) => {
                if (u.telephone && u.telephone.includes(':')) {
                    u.telephone = encryptionService.decrypt(u.telephone);
                }
                if (u.two_factor_secret && u.two_factor_secret.includes(':')) {
                    u.two_factor_secret = encryptionService.decrypt(u.two_factor_secret);
                }
            };
            if (Array.isArray(users)) {
                users.forEach(decryptUser);
            } else {
                decryptUser(users);
            }
        }
    }
});

module.exports = User;
