const { Conversation, Message, ConversationParticipant, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const messageController = {
    // 1. Récupérer toutes les conversations de l'utilisateur
    getConversations: async (req, res, next) => {
        try {
            const conversations = await Conversation.findAll({
                include: [
                    {
                        model: ConversationParticipant,
                        as: 'details_participants',
                        where: { user_id: req.user.id }
                    },
                    {
                        model: User,
                        as: 'participants',
                        where: { id: { [Op.ne]: req.user.id } }, // Les autres participants
                        attributes: ['id', 'nom_complet', 'role'],
                    }
                ],
                order: [['date_dernier_message', 'DESC']]
            });
            res.json(conversations);
        } catch (error) {
            next(error);
        }
    },

    // 2. Récupérer les messages d'une conversation spécifique
    getMessages: async (req, res, next) => {
        try {
            const { conversationId } = req.params;

            // Vérifier que l'utilisateur participe bien à cette conversation
            const participant = await ConversationParticipant.findOne({
                where: { conversation_id: conversationId, user_id: req.user.id }
            });
            if (!participant) return res.status(403).json({ message: "Non autorisé" });

            const messages = await Message.findAll({
                where: { conversation_id: conversationId },
                order: [['createdAt', 'ASC']],
                limit: 100
            });

            // Marquer comme lus
            await Message.update({ est_lu: true }, {
                where: { conversation_id: conversationId, expediteur_id: { [Op.ne]: req.user.id } }
            });

            res.json(messages);
        } catch (error) {
            next(error);
        }
    },

    // 4. Démarrer ou récupérer une conversation
    startConversation: async (req, res, next) => {
        try {
            const { destinataire_id } = req.body;
            if (!destinataire_id) return res.status(400).json({ message: 'destinataire_id requis' });

            // Chercher une conversation existante entre les deux
            const existing = await ConversationParticipant.findAll({
                where: { user_id: [req.user.id, destinataire_id] },
                attributes: ['conversation_id'],
                raw: true
            });
            const countMap = {};
            existing.forEach(p => { countMap[p.conversation_id] = (countMap[p.conversation_id] || 0) + 1; });
            const sharedConvId = Object.keys(countMap).find(id => countMap[id] === 2);

            if (sharedConvId) {
                const conv = await Conversation.findByPk(sharedConvId, {
                    include: [{ model: User, as: 'participants', where: { id: { [Op.ne]: req.user.id } }, attributes: ['id', 'nom_complet', 'role'] }]
                });
                return res.json(conv);
            }

            // Créer une nouvelle conversation
            const newConv = await Conversation.create({ dernier_message: '', date_dernier_message: new Date() });
            await ConversationParticipant.bulkCreate([
                { conversation_id: newConv.id, user_id: req.user.id },
                { conversation_id: newConv.id, user_id: destinataire_id }
            ]);

            const conv = await Conversation.findByPk(newConv.id, {
                include: [{ model: User, as: 'participants', where: { id: { [Op.ne]: req.user.id } }, attributes: ['id', 'nom_complet', 'role'] }]
            });
            res.status(201).json(conv);
        } catch (error) {
            next(error);
        }
    },

    // 5. Marquer une conversation comme lue
    markAsRead: async (req, res, next) => {
        try {
            const { conversationId } = req.params;
            await Message.update(
                { est_lu: true },
                { where: { conversation_id: conversationId, expediteur_id: { [Op.ne]: req.user.id } } }
            );
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    // 6. Nombre de messages non lus
    getUnreadCount: async (req, res, next) => {
        try {
            // Trouver les conversations de l'utilisateur
            const participations = await ConversationParticipant.findAll({
                where: { user_id: req.user.id },
                attributes: ['conversation_id'],
                raw: true
            });
            const convIds = participations.map(p => p.conversation_id);
            if (!convIds.length) return res.json({ count: 0 });

            const count = await Message.count({
                where: {
                    conversation_id: { [Op.in]: convIds },
                    expediteur_id: { [Op.ne]: req.user.id },
                    est_lu: false
                }
            });
            res.json({ count });
        } catch (error) {
            next(error);
        }
    },

    // 7. Envoyer un message
    sendMessage: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { destinataire_id, contenu, conversation_id } = req.body;
            const file = req.file;

            // Déterminer le type et le contenu
            let msgType = 'text';
            let msgContenu = contenu || '';
            let metadata = null;

            if (file) {
                const mime = file.mimetype;
                const fileUrl = `${req.protocol}://${req.get('host')}/uploads/messages/${file.filename}`;

                if (mime.startsWith('image/')) {
                    msgType = 'image';
                    msgContenu = fileUrl;
                } else if (mime.startsWith('audio/')) {
                    msgType = 'audio';
                    msgContenu = fileUrl;
                } else {
                    msgType = 'file';
                    msgContenu = fileUrl;
                }
                metadata = {
                    originalName: file.originalname,
                    size: file.size,
                    mimeType: mime
                };
            }

            if (!msgContenu) return res.status(400).json({ message: 'Contenu ou fichier requis' });

            let convId = conversation_id;

            if (!convId) {
                if (!destinataire_id) return res.status(400).json({ message: 'destinataire_id requis' });
                const existingParticipants = await ConversationParticipant.findAll({
                    where: { user_id: [req.user.id, destinataire_id] },
                    attributes: ['conversation_id'],
                    raw: true
                });
                const countMap = {};
                existingParticipants.forEach(p => {
                    countMap[p.conversation_id] = (countMap[p.conversation_id] || 0) + 1;
                });
                const sharedConvId = Object.keys(countMap).find(id => countMap[id] === 2);

                if (sharedConvId) {
                    convId = sharedConvId;
                } else {
                    const newConv = await Conversation.create({
                        dernier_message: msgType === 'text' ? msgContenu : `[ ${msgType} ]`,
                        date_dernier_message: new Date()
                    }, { transaction: t });
                    await ConversationParticipant.bulkCreate([
                        { conversation_id: newConv.id, user_id: req.user.id },
                        { conversation_id: newConv.id, user_id: destinataire_id }
                    ], { transaction: t });
                    convId = newConv.id;
                }
            }

            const message = await Message.create({
                conversation_id: convId,
                expediteur_id: req.user.id,
                contenu: msgContenu,
                type: msgType,
                metadata
            }, { transaction: t });

            const preview = msgType === 'text' ? msgContenu : `[ ${msgType} ]`;
            await Conversation.update({
                dernier_message: preview,
                date_dernier_message: new Date()
            }, { where: { id: convId }, transaction: t });

            await t.commit();

            const io = req.app.get('socketio');
            if (io) {
                io.to(destinataire_id || '').emit('new_message', { message, conversation_id: convId });
            }

            res.status(201).json(message);
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }
};

module.exports = messageController;
