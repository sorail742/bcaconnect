const { Op } = require('sequelize');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const ConversationParticipant = require('../models/conversationParticipant.model');
const { User } = require('../../models');

const messageRepository = {
    findConversationsForUser(userId) {
        return Conversation.findAll({
            include: [
                {
                    model: ConversationParticipant,
                    as: 'details_participants',
                    where: { user_id: userId, est_invisible: false }
                },
                {
                    model: User,
                    as: 'participants',
                    where: { id: { [Op.ne]: userId } }, // Les autres participants
                    attributes: ['id', 'nom_complet', 'role'],
                }
            ],
            order: [['date_dernier_message', 'DESC']]
        });
    },

    findParticipant(conversationId, userId, { transaction } = {}) {
        return ConversationParticipant.findOne({
            where: { conversation_id: conversationId, user_id: userId },
            transaction,
        });
    },

    findMessagesForConversation(conversationId, limit = 100) {
        return Message.findAll({
            where: { conversation_id: conversationId },
            order: [['createdAt', 'ASC']],
            limit,
        });
    },

    markMessagesRead(conversationId, exceptUserId) {
        return Message.update({ est_lu: true }, {
            where: { conversation_id: conversationId, expediteur_id: { [Op.ne]: exceptUserId } }
        });
    },

    findUserAttributes(userId, attributes, { transaction } = {}) {
        return User.findByPk(userId, { attributes, transaction });
    },

    findParticipationsRaw(userIds, { transaction } = {}) {
        return ConversationParticipant.findAll({
            where: { user_id: userIds },
            attributes: ['conversation_id', 'user_id'],
            raw: true,
            transaction,
        });
    },

    countParticipants(conversationId, { transaction } = {}) {
        return ConversationParticipant.count({ where: { conversation_id: conversationId }, transaction });
    },

    findConversationWithOtherParticipant(conversationId, excludeUserId) {
        return Conversation.findByPk(conversationId, {
            include: [{ model: User, as: 'participants', where: { id: { [Op.ne]: excludeUserId } }, attributes: ['id', 'nom_complet', 'role'] }]
        });
    },

    createConversation(data, { transaction } = {}) {
        return Conversation.create(data, { transaction });
    },

    bulkCreateParticipants(data, { transaction } = {}) {
        return ConversationParticipant.bulkCreate(data, { transaction });
    },

    findOtherParticipant(conversationId, excludeUserId, { transaction } = {}) {
        return ConversationParticipant.findOne({
            where: { conversation_id: conversationId, user_id: { [Op.ne]: excludeUserId } },
            attributes: ['user_id'],
            raw: true,
            transaction,
        });
    },

    createMessage(data, { transaction } = {}) {
        return Message.create(data, { transaction });
    },

    updateConversationPreview(conversationId, data, { transaction } = {}) {
        return Conversation.update(data, { where: { id: conversationId }, transaction });
    },

    findParticipantsForUsers(userIds) {
        return ConversationParticipant.findAll({
            where: { user_id: userIds },
            attributes: ['conversation_id', 'user_id'],
            raw: true,
        });
    },

    countUnread(conversationIds, exceptUserId) {
        return Message.count({
            where: {
                conversation_id: { [Op.in]: conversationIds },
                expediteur_id: { [Op.ne]: exceptUserId },
                est_lu: false
            }
        });
    },

    saveParticipant(participant) {
        return participant.save();
    },

    findUserById(userId) {
        return User.findByPk(userId);
    },

    saveUser(user) {
        return user.save();
    },
};

module.exports = messageRepository;
