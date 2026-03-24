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

    // 3. Envoyer un message
    sendMessage: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { destinataire_id, contenu, conversation_id } = req.body;
            let convId = conversation_id;

            // Si on commence une nouvelle conversation
            if (!convId) {
                // Vérifier si une conversation existe déjà entre ces deux personnes (1-1)
                const existingParticipants = await ConversationParticipant.findAll({
                    where: { user_id: [req.user.id, destinataire_id] },
                    attributes: ['conversation_id'],
                    group: ['conversation_id'],
                    having: sequelize.literal('count(conversation_id) = 2')
                });

                if (existingParticipants.length > 0) {
                    convId = existingParticipants[0].conversation_id;
                } else {
                    const newConv = await Conversation.create({
                        dernier_message: contenu,
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
                contenu,
                type: 'text'
            }, { transaction: t });

            // Mettre à jour la conversation
            await Conversation.update({
                dernier_message: contenu,
                date_dernier_message: new Date()
            }, { where: { id: convId }, transaction: t });

            await t.commit();

            // ⚡ TEMPS RÉEL
            const io = req.app.get('socketio');
            if (io) {
                // Envoyer au destinataire (sur son canal personnel)
                io.to(destinataire_id).emit('new_message', {
                    message,
                    conversation_id: convId
                });
                // Envoyer à soi-même aussi (pour sync multi-tabs)?
                // io.to(req.user.id).emit('new_message', { message, conversation_id: convId });
            }

            res.status(201).json(message);
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }
};

module.exports = messageController;
