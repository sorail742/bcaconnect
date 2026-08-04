const notificationService = require('../service/notification.service');

const notificationController = {
    // Récupérer les notifications de l'utilisateur connecté
    getMyNotifications: async (req, res, next) => {
        try {
            const notifications = await notificationService.getMyNotifications(req.user.id);
            res.json(notifications);
        } catch (error) {
            next(error);
        }
    },

    // Marquer une notification comme lue
    markAsRead: async (req, res, next) => {
        try {
            const result = await notificationService.markAsRead(req.params.id, req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    // Tout marquer comme lu
    markAllAsRead: async (req, res, next) => {
        try {
            const result = await notificationService.markAllAsRead(req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    // Supprimer une notification
    delete: async (req, res, next) => {
        try {
            const result = await notificationService.delete(req.params.id, req.user.id, req);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = notificationController;
