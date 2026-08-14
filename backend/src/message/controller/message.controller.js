const messageService = require('../service/message.service');

const messageController = {
    // 1. Récupérer toutes les conversations de l'utilisateur
    getConversations: async (req, res, next) => {
        try {
            const conversations = await messageService.getConversations(req.user.id);
            res.json(conversations);
        } catch (error) {
            next(error);
        }
    },

    // 2. Récupérer les messages d'une conversation spécifique
    getMessages: async (req, res, next) => {
        try {
            const result = await messageService.getMessages(req.params.conversationId, req.user.id);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.json(result.messages);
        } catch (error) {
            next(error);
        }
    },

    // 4. Démarrer ou récupérer une conversation
    startConversation: async (req, res, next) => {
        try {
            const result = await messageService.startConversation(req.body.destinataire_id, req.user.id);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.status(result.status).json(result.conversation);
        } catch (error) {
            next(error);
        }
    },

    // 5. Marquer une conversation comme lue
    markAsRead: async (req, res, next) => {
        try {
            const result = await messageService.markAsRead(req.params.conversationId, req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    // 6. Nombre de messages non lus
    getUnreadCount: async (req, res, next) => {
        try {
            const result = await messageService.getUnreadCount(req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    // 7. Envoyer un message
    sendMessage: async (req, res, next) => {
        try {
            const io = req.app.get('socketio');
            const result = await messageService.sendMessage(req.body, req.file, req.user, io);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.status(201).json(result.message);
        } catch (error) {
            next(error);
        }
    },

    // 8. Supprimer une conversation (masquage côté utilisateur uniquement)
    deleteConversation: async (req, res, next) => {
        try {
            const result = await messageService.deleteConversation(req.params.conversationId, req.user.id);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    // 9. Bloquer l'autre participant d'une conversation
    blockUser: async (req, res, next) => {
        try {
            const result = await messageService.blockUser(req.params.conversationId, req.user.id);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = messageController;
