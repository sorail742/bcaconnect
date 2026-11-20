// NOTE: Notification appartient à la feature `notification` (pas encore migrée) —
// à remplacer par un appel à notificationService une fois cette feature migrée.
const { Notification } = require('../../models');

const paymentRepository = {
    createNotification(data, { transaction } = {}) {
        return Notification.create(data, { transaction });
    },
};

module.exports = paymentRepository;
