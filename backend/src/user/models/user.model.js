const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const encryptionService = require('../../utils/encryptionService');

// Champs texte sensibles chiffrés au repos (AES-256-GCM) — mêmes hooks beforeSave/afterFind/afterCreate/afterUpdate.
const ENCRYPTED_FIELDS = ['telephone', 'two_factor_secret', 'adresse', 'registre_commerce', 'numero_agrement'];

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
        type: DataTypes.STRING(255), // Augmenté pour le chiffrement (IV:Tag:Encrypted)
        allowNull: false,
        unique: true,
    },
    mot_de_passe: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'fournisseur', 'transporteur', 'client', 'banque', 'technicien'),
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
    },
    // ── Champs spécifiques par rôle (Standard BCA v2.6) ──────────
    adresse: {
        type: DataTypes.STRING(500), // Augmenté pour le chiffrement (IV:Tag:Encrypted)
        allowNull: true,
        comment: 'Adresse de livraison (client) ou adresse commerciale (fournisseur)',
    },
    categorie_activite: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Secteur d\'activité du fournisseur (Agriculture, Mode, Technologie...)',
    },
    registre_commerce: {
        type: DataTypes.STRING(255), // Augmenté pour le chiffrement (IV:Tag:Encrypted)
        allowNull: true,
        comment: 'Numéro de registre de commerce du fournisseur (validation admin)',
    },
    metadata_transporteur: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Données transporteur: { type_vehicule, numero_permis, zone_couverture, disponibilite }',
    },
    avatar_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL de la photo de profil de l\'utilisateur',
    },
    points_fidelite: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Points de fidélité accumulés par l\'utilisateur',
    },
    specialites: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Spécialités du technicien (ex: plomberie, électricité)"
    },
    numero_agrement: {
        type: DataTypes.STRING(255), // Augmenté pour le chiffrement (IV:Tag:Encrypted)
        allowNull: true,
        comment: "Numéro d'agrément du technicien (optionnel)"
    },
    zone_intervention: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Zone d'intervention du technicien"
    },
    location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Dernière position GPS du transporteur { type: Point, coordinates: [lng, lat] }',
    },
    code_pin_offline: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Hash bcrypt du code PIN pour l\'authentification hors ligne (mode résilience)',
    },
    blocked_users: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Liste des IDs utilisateurs bloqués par cet utilisateur (messagerie)',
    },

}, {
    tableName: 'utilisateurs',
    hooks: {
        beforeSave: (user) => {
            // Chiffrement données sensibles
            ENCRYPTED_FIELDS.forEach((field) => {
                if (typeof user[field] === 'string' && !user[field].includes(':')) {
                    user[field] = encryptionService.encrypt(user[field]);
                }
            });
        },
        afterFind: (users) => {
            if (!users) return;
            const decryptUser = (u) => {
                ENCRYPTED_FIELDS.forEach((field) => {
                    if (typeof u[field] === 'string' && u[field].includes(':')) {
                        u[field] = encryptionService.decrypt(u[field]);
                    }
                });
            };
            if (Array.isArray(users)) {
                users.forEach(decryptUser);
            } else {
                decryptUser(users);
            }
        },
        afterCreate: (user) => {
            ENCRYPTED_FIELDS.forEach((field) => {
                if (typeof user[field] === 'string' && user[field].includes(':')) {
                    user[field] = encryptionService.decrypt(user[field]);
                }
            });
        },
        afterUpdate: (user) => {
            ENCRYPTED_FIELDS.forEach((field) => {
                if (typeof user[field] === 'string' && user[field].includes(':')) {
                    user[field] = encryptionService.decrypt(user[field]);
                }
            });
        }
    }
});

module.exports = User;
