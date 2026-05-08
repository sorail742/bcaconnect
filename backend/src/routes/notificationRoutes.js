const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Protection globale : toutes les routes nécessitent d'être connecté
router.use(authMiddleware);

// Récupérer les notifications
router.get('/', notificationController.getMyNotifications);

// Marquer une notification comme lue
router.patch('/:id/read', notificationController.markAsRead);

// Tout marquer comme lu
router.post('/mark-all-read', notificationController.markAllAsRead);

// Supprimer une notification
router.delete('/:id', notificationController.delete);

module.exports = router;
