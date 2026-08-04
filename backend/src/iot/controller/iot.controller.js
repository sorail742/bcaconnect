const iotService = require('../service/iot.service');

const iotController = {
    logIoTData: async (req, res) => {
        try {
            const { commande_id, latitude, longitude, temperature, humidite } = req.body;
            const log = await iotService.logSensorData({ commande_id, latitude, longitude, temperature, humidite });
            res.status(201).json({ message: 'Données IoT enregistrées', log });
        } catch (error) {
            console.error("Erreur IoT Log:", error);
            res.status(500).json({ error: 'Erreur lors de l\'enregistrement des données IoT' });
        }
    },

    createSmartContract: async (req, res) => {
        try {
            const { commande_id, type_contrat } = req.body;
            const stub = await iotService.createSmartContract({ commande_id, type_contrat });
            res.status(201).json({ message: 'Contrat intelligent simulé généré', stub });
        } catch (error) {
            console.error("Erreur Blockchain Stub:", error);
            res.status(500).json({ error: 'Erreur lors de la création du stub blockchain' });
        }
    },
};

module.exports = iotController;
