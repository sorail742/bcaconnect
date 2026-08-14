const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Ligne unique verrouillée (SELECT ... FOR UPDATE) à chaque émission de
 * facture — garantit une numérotation strictement séquentielle sans trou,
 * exigée par le CGI Guinée en cas de contrôle fiscal. Jamais de reset
 * annuel : un compteur global monotone évite toute ambiguïté d'audit.
 */
const InvoiceCounter = sequelize.define('InvoiceCounter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    dernier_numero: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
    tableName: 'compteurs_facture',
    underscored: true,
    timestamps: false,
});

module.exports = InvoiceCounter;
