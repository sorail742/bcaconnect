const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// Ces routes pourraient être protégées par une clé API matérielle à l'avenir
router.post('/sensor-data', iotController.logIoTData);
router.post('/smart-contract', iotController.createSmartContract);

module.exports = router;
