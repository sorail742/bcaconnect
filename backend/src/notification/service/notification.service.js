const AppError = require('../../utils/AppError');
const { recordDeletion } = require('../../deletion-log/service/deletionLog.service');
const notificationRepository = require('../repository/notification.repository');

const notificationService = {
    // Récupérer les notifications de l'utilisateur connecté
    async getMyNotifications(userId) {
        return notificationRepository.findAllByUser(userId, 50);
    },

    // Marquer une notification comme lue
    async markAsRead(id, userId) {
        const notification = await notificationRepository.findByIdForUser(id, userId);
        if (!notification) {
            throw new AppError("Notification non trouvée.", 404);
        }

        await notificationRepository.updateInstance(notification, { est_lu: true });
        return { message: "Notification marquée comme lue." };
    },

    // Tout marquer comme lu
    async markAllAsRead(userId) {
        await notificationRepository.markAllReadForUser(userId);
        return { message: "Toutes les notifications ont été marquées comme lues." };
    },

    // Supprimer une notification
    async delete(id, userId, req) {
        const notification = await notificationRepository.findByIdForUser(id, userId);
        if (!notification) {
            throw new AppError("Notification non trouvée.", 404);
        }

        await recordDeletion('Notification', notification, { req });
        await notificationRepository.destroy(notification);
        return { message: "Notification supprimée." };
    }
};

module.exports = notificationService;
