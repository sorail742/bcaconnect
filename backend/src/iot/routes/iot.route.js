const express = require('express');
const router = express.Router();
const iotController = require('../controller/iot.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { validateOrderIdParam, validateActivate, validateSensorData } = require('../validator/iot.validator');

const BLOCKCHAIN_STUB_ENABLED = process.env.IOT_STUB_ENABLED === 'true' || process.env.NODE_ENV !== 'production';

/** Le smart contract reste un stub de développement — voir cahier des charges 3.16. */
const blockchainStubGuard = (req, res, next) => {
    if (!BLOCKCHAIN_STUB_ENABLED) {
        return res.status(501).json({
            message: 'Module blockchain non activé en production.',
            stub: true,
        });
    }
    res.setHeader('X-BCA-Stub', 'blockchain-v1');
    next();
};

// Provisionnement / consultation du suivi IoT — authentification utilisateur BCA
router.post('/devices/:orderId/activate', protect, validateActivate, iotController.activateDevice);
router.post('/devices/:orderId/deactivate', protect, validateOrderIdParam, iotController.deactivateDevice);
router.get('/orders/:orderId/tracking', protect, validateOrderIdParam, iotController.getTracking);

// Ingestion capteur — authentifiée par clé d'appareil (X-Device-Key), pas
// par session utilisateur : c'est l'appareil physique qui appelle cette
// route, jamais un navigateur.
router.post('/sensor-data', validateSensorData, iotController.logIoTData);

// Contrat intelligent : toujours un stub (cf. 3.16)
router.post('/smart-contract', blockchainStubGuard, iotController.createSmartContract);

module.exports = router;
