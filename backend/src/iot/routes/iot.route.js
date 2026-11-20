const express = require('express');
const router = express.Router();
const iotController = require('../controller/iot.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { validateOrderIdParam, validateActivate, validateSensorData, validateSmartContract } = require('../validator/iot.validator');

const BLOCKCHAIN_MODULE_ENABLED = process.env.BLOCKCHAIN_ENABLED !== 'false';

/**
 * Coupe-circuit opérationnel séparé de la configuration du portefeuille
 * (`blockchainConfig.isConfigured()`, vérifiée dans le service) : permet de
 * désactiver le module en production sans retirer la clé privée. Le module
 * appelle réellement Polygon Amoy (testnet) — cf. cahier des charges 3.16.
 */
const blockchainGuard = (req, res, next) => {
    if (!BLOCKCHAIN_MODULE_ENABLED) {
        return res.status(503).json({ message: 'Module blockchain désactivé (BLOCKCHAIN_ENABLED=false).' });
    }
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

// Ancrage on-chain (Polygon Amoy testnet) — authentification utilisateur BCA,
// autorisation vérifiée dans le service (vendeur de la commande ou admin).
router.post('/smart-contract', protect, validateSmartContract, blockchainGuard, iotController.createSmartContract);
router.get('/orders/:orderId/smart-contracts', protect, validateOrderIdParam, iotController.listSmartContracts);

module.exports = router;
