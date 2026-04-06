const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
}, {
    tableName: 'boutiques',
});

module.exports = Store;
