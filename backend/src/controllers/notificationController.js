const { Notification } = require('../models');

const notificationController = {
    // Récupérer les notifications de l'utilisateur connecté
    getMyNotifications: async (req, res, next) => {
        try {
            const notifications = await Notification.findAll({
                where: { utilisateur_id: req.user.id },
                order: [['createdAt', 'DESC']],
                limit: 50
            });
            res.json(notifications);
        } catch (error) {
            next(error);
        }
    },

    // Marquer une notification comme lue
    markAsRead: async (req, res, next) => {
        try {
            const { id } = req.params;
            const notification = await Notification.findOne({
                where: { id, utilisateur_id: req.user.id }
            });

            if (!notification) {
                return res.status(404).json({ message: "Notification non trouvée." });
            }

            await notification.update({ est_lu: true });
            res.json({ message: "Notification marquée comme lue." });
        } catch (error) {
            next(error);
        }
    },

    // Tout marquer comme lu
    markAllAsRead: async (req, res, next) => {
        try {
            await Notification.update(
                { est_lu: true },
                { where: { utilisateur_id: req.user.id, est_lu: false } }
            );
            res.json({ message: "Toutes les notifications ont été marquées comme lues." });
        } catch (error) {
            next(error);
        }
    },

    // Supprimer une notification
    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            const notification = await Notification.findOne({
                where: { id, utilisateur_id: req.user.id }
            });

            if (!notification) {
                return res.status(404).json({ message: "Notification non trouvée." });
            }

            await notification.destroy();
            res.json({ message: "Notification supprimée." });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = notificationController;
