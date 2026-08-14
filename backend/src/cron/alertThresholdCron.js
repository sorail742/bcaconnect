const cron = require('node-cron');
const alertThresholdService = require('../alert-threshold/service/alertThreshold.service');

/**
 * Évalue les seuils d'alerte dynamiques (prix/stock, cahier des charges
 * 3.6) toutes les 30 minutes — plus fréquent que le cron de stock global
 * (quotidien) car ce sont des seuils personnalisés que l'utilisateur
 * attend de voir réagir rapidement.
 */
const runAlertThresholds = async (io = null) => {
    try {
        const { evalues, declenches } = await alertThresholdService.evaluateAll(io);
        if (declenches > 0) {
            console.log(`🔔 Seuils d'alerte : ${declenches}/${evalues} déclenchés.`);
        }
    } catch (error) {
        console.error("❌ Erreur lors du job d'évaluation des seuils d'alerte :", error);
    }
};

const startAlertThresholds = (io) => {
    cron.schedule('*/30 * * * *', () => {
        runAlertThresholds(io);
    });
    console.log("⏰ Cron job 'Alert Thresholds' programmé (toutes les 30 min)");
};

module.exports = { startAlertThresholds, runAlertThresholds };
