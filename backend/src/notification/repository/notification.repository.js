const Notification = require('../models/notification.model');

const notificationRepository = {
    findAllByUser(userId, limit = 50) {
        return Notification.findAll({
            where: { utilisateur_id: userId },
            order: [['createdAt', 'DESC']],
            limit,
        });
    },

    findByIdForUser(id, userId) {
        return Notification.findOne({ where: { id, utilisateur_id: userId } });
    },

    updateInstance(notification, data) {
        return notification.update(data);
    },

    markAllReadForUser(userId) {
        return Notification.update(
            { est_lu: true },
            { where: { utilisateur_id: userId, est_lu: false } }
        );
    },

    destroy(notification) {
        return notification.destroy();
    },
};

module.exports = notificationRepository;
