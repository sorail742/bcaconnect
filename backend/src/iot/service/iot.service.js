const iotRepository = require('../repository/iot.repository');

const iotService = {
    // Simuler la réception de données d'un capteur IoT
    async logSensorData({ commande_id, latitude, longitude, temperature, humidite }) {
        return iotRepository.createTrackingLog({
            commande_id,
            latitude,
            longitude,
            temperature_celsius: temperature,
            humidite_pourcentage: humidite,
            timestamp_appareil: new Date(),
        });
    },

    // Simuler la création d'un contrat intelligent
    async createSmartContract({ commande_id, type_contrat }) {
        // Simuler un hash blockchain
        const mockHash = '0x' + Math.random().toString(16).slice(2) + Date.now().toString(16);

        return iotRepository.createBlockchainStub({
            commande_id,
            type_contrat,
            hash_transaction: mockHash,
            statut_onchain: 'confirmed',
        });
    },
};

module.exports = iotService;
