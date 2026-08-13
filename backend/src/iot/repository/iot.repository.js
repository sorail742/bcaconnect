const { IoTTrackingLog, BlockchainTransactionStub, Order } = require('../../models');

const iotRepository = {
    createTrackingLog(data) {
        return IoTTrackingLog.create(data);
    },

    findLogsByOrder(commande_id) {
        return IoTTrackingLog.findAll({ where: { commande_id }, order: [['timestamp_appareil', 'ASC']] });
    },

    findLastLogByOrder(commande_id) {
        return IoTTrackingLog.findOne({ where: { commande_id }, order: [['timestamp_appareil', 'DESC']] });
    },

    findOrderById(id) {
        return Order.findByPk(id);
    },

    updateOrder(order, data) {
        return order.update(data);
    },

    createBlockchainStub(data) {
        return BlockchainTransactionStub.create(data);
    },
};

module.exports = iotRepository;
