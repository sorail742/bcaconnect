const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

const IOT_STUB_ENABLED = process.env.IOT_STUB_ENABLED === 'true' || process.env.NODE_ENV !== 'production';

/** IoT / Blockchain : stubs de développement uniquement */
const iotStubGuard = (req, res, next) => {
    if (!IOT_STUB_ENABLED) {
        return res.status(501).json({
            message: 'Module IoT/Blockchain non activé en production.',
            stub: true,
        });
    }
    res.setHeader('X-BCA-Stub', 'iot-blockchain-v1');
    next();
};

router.use(iotStubGuard);
router.post('/sensor-data', iotController.logIoTData);
router.post('/smart-contract', iotController.createSmartContract);

module.exports = router;
