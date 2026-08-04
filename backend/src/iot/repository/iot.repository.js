const { IoTTrackingLog, BlockchainTransactionStub } = require('../../models');

const iotRepository = {
    createTrackingLog(data) {
        return IoTTrackingLog.create(data);
    },

    createBlockchainStub(data) {
        return BlockchainTransactionStub.create(data);
    },
};

module.exports = iotRepository;
