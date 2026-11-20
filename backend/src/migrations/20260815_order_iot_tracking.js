'use strict';

/**
 * Suivi IoT temps réel par commande (cahier des charges 3.15) — un envoi
 * équipé d'un capteur physique (chaîne du froid...) est activé
 * individuellement ; iot_device_key_hash authentifie les POST de données
 * capteur pour cette commande précise (voir iot.service.js).
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('commandes');

        if (!table.suivi_iot_actif) {
            await queryInterface.addColumn('commandes', 'suivi_iot_actif', {
                type: Sequelize.BOOLEAN, defaultValue: false,
            });
        }
        if (!table.iot_device_key_hash) {
            await queryInterface.addColumn('commandes', 'iot_device_key_hash', {
                type: Sequelize.STRING(255), allowNull: true,
            });
        }
        if (!table.iot_temp_min) {
            await queryInterface.addColumn('commandes', 'iot_temp_min', {
                type: Sequelize.DECIMAL(5, 2), allowNull: true,
            });
        }
        if (!table.iot_temp_max) {
            await queryInterface.addColumn('commandes', 'iot_temp_max', {
                type: Sequelize.DECIMAL(5, 2), allowNull: true,
            });
        }

        const logsTable = await queryInterface.describeTable('iot_tracking_logs').catch(() => null);
        if (logsTable && !logsTable.hors_seuil) {
            await queryInterface.addColumn('iot_tracking_logs', 'hors_seuil', {
                type: Sequelize.BOOLEAN, defaultValue: false,
            });
        }
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('iot_tracking_logs', 'hors_seuil').catch(() => {});
        await queryInterface.removeColumn('commandes', 'iot_temp_max').catch(() => {});
        await queryInterface.removeColumn('commandes', 'iot_temp_min').catch(() => {});
        await queryInterface.removeColumn('commandes', 'iot_device_key_hash').catch(() => {});
        await queryInterface.removeColumn('commandes', 'suivi_iot_actif').catch(() => {});
    },
};
