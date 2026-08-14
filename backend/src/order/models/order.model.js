const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const encryptionService = require('../../utils/encryptionService');

const SENSITIVE_FIELDS = ['telephone_livraison', 'adresse_livraison'];

const encryptField = (value) => {
    if (typeof value === 'string' && value && !value.includes(':')) {
        return encryptionService.encrypt(value);
    }
    return value;
};

const decryptField = (value) => {
    if (typeof value === 'string' && value.includes(':')) {
        return encryptionService.decrypt(value);
    }
    return value;
};

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    total_ttc: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    frais_port: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    type_livraison: {
        type: DataTypes.STRING(20),
        defaultValue: 'standard',
    },
    delai_estime_jours: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    date_livraison_prevue: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Échéance de livraison calculée à la commande (date_commande + delai_estime_jours)',
    },
    statut: {
        type: DataTypes.STRING(32),
        defaultValue: 'en_attente_paiement',
    },
    mode_resilience: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    cle_idempotence: {
        type: DataTypes.STRING(255),
        unique: true,
    },
    signature_offline: {
        type: DataTypes.TEXT,
    },
    statut_livraison: {
        type: DataTypes.STRING(32),
        defaultValue: 'en_attente',
    },
    transporteur_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    delivery_otp: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    delivery_group_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    nom_destinataire: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    telephone_livraison: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    adresse_livraison: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    date_commande: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    methode_paiement: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    coupon_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    code_promo: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    montant_reduction: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    // Suivi IoT temps réel (cahier des charges 3.15) — activé par le vendeur
    // ou le transporteur pour un envoi équipé d'un capteur physique
    // (chaîne du froid, fragile...). iot_device_key_hash n'est jamais exposé
    // en clair après sa génération initiale (voir iot.service.js).
    suivi_iot_actif: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    iot_device_key_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    iot_temp_min: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    iot_temp_max: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
}, {
    tableName: 'commandes',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeSave: (order) => {
            SENSITIVE_FIELDS.forEach((field) => {
                if (order.changed(field)) {
                    order[field] = encryptField(order[field]);
                }
            });
        },
        afterFind: (orders) => {
            if (!orders) return;
            const decryptOrder = (o) => {
                SENSITIVE_FIELDS.forEach((field) => {
                    o[field] = decryptField(o[field]);
                });
            };
            if (Array.isArray(orders)) orders.forEach(decryptOrder);
            else decryptOrder(orders);
        },
        afterCreate: (order) => {
            SENSITIVE_FIELDS.forEach((field) => {
                order[field] = decryptField(order[field]);
            });
        },
        afterUpdate: (order) => {
            SENSITIVE_FIELDS.forEach((field) => {
                order[field] = decryptField(order[field]);
            });
        }
    }
});

module.exports = Order;
