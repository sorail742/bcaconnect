const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom_boutique: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    slug: {
        type: DataTypes.STRING(150),
        unique: true,
    },
    statut: {
        type: DataTypes.STRING(20),
        defaultValue: 'actif',
    },
    email_boutique: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    telephone_boutique: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // Niveau de vérification (analyse concurrentielle #5) — calculé depuis le
    // nombre de certifications validées : 'non_verifie' | 'verifie' | 'verifie_or'.
    niveau_verification: {
        type: DataTypes.STRING(20),
        defaultValue: 'non_verifie',
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 4.5,
    },
    use_carousel: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    banner_images: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('banner_images');
            if (!val) return [];
            try { return JSON.parse(val); } catch { return []; }
        },
        set(val) {
            this.setDataValue('banner_images', val ? JSON.stringify(val) : null);
        }
    },
    categorie_principale: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    temps_reponse: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '< 2h',
    },
    localisation: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: 'Guinée',
    },
    plan: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'gratuit',
        comment: "'gratuit' (plafond de produits) ou 'pro' (illimité, abonnement payant)",
    },
    plan_expire_le: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Date d'expiration du plan 'pro' — repasse en 'gratuit' une fois dépassée",
    },
    /* location: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: true,
        comment: 'Geospatial coordinates of the store',
    }, */
}, {
    tableName: 'boutiques',
    underscored: true,
    timestamps: true,
});

module.exports = Store;
