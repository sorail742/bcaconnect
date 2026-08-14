const catchAsync = require('../../utils/catchAsync');
const iotService = require('../service/iot.service');

const iotController = {
    activateDevice: catchAsync(async (req, res) => {
        const result = await iotService.activateDevice(req.params.orderId, req.body, req.user);
        res.status(201).json(result);
    }),

    deactivateDevice: catchAsync(async (req, res) => {
        const result = await iotService.deactivateDevice(req.params.orderId, req.user);
        res.json(result);
    }),

    logIoTData: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const { commande_id, latitude, longitude, temperature, humidite } = req.body;
        const deviceKey = req.headers['x-device-key'];
        const log = await iotService.logSensorData(
            { commande_id, device_key: deviceKey, latitude, longitude, temperature, humidite },
            io,
        );
        res.status(201).json({ message: 'Données IoT enregistrées', log });
    }),

    getTracking: catchAsync(async (req, res) => {
        const result = await iotService.getTracking(req.params.orderId, req.user);
        res.json(result);
    }),

    createSmartContract: catchAsync(async (req, res) => {
        const { commande_id, type_contrat } = req.body;
        const stub = await iotService.createSmartContract({ commande_id, type_contrat }, req.user);
        res.status(201).json({ message: 'Preuve ancrée sur Polygon Amoy (testnet)', stub });
    }),

    listSmartContracts: catchAsync(async (req, res) => {
        const stubs = await iotService.listSmartContracts(req.params.orderId, req.user);
        res.json({ stubs });
    }),
};

module.exports = iotController;
