const { sequelize } = require('../../models');
const messageRepository = require('../repository/message.repository');

const isBlockedPair = (userA, userB) => {
    const blockedA = Array.isArray(userA?.blocked_users) ? userA.blocked_users : [];
    const blockedB = Array.isArray(userB?.blocked_users) ? userB.blocked_users : [];
    return blockedA.includes(userB.id) || blockedB.includes(userA.id);
};

const messageService = {
    // 1. Récupérer toutes les conversations de l'utilisateur
    async getConversations(userId) {
        return messageRepository.findConversationsForUser(userId);
    },

    // 2. Récupérer les messages d'une conversation spécifique
    async getMessages(conversationId, userId) {
        // Vérifier que l'utilisateur participe bien à cette conversation
        const participant = await messageRepository.findParticipant(conversationId, userId);
        if (!participant) return { outcome: 'rejected', status: 403, message: "Non autorisé" };

        const messages = await messageRepository.findMessagesForConversation(conversationId, 100);

        // Marquer comme lus
        await messageRepository.markMessagesRead(conversationId, userId);

        return { outcome: 'found', messages };
    },

    // 4. Démarrer ou récupérer une conversation
    async startConversation(destinataire_id, userId) {
        if (!destinataire_id) return { outcome: 'rejected', status: 400, message: 'destinataire_id requis' };
        if (destinataire_id === userId) {
            return { outcome: 'rejected', status: 400, message: 'Impossible de démarrer une conversation avec soi-même' };
        }

        const [sender, recipient] = await Promise.all([
            messageRepository.findUserAttributes(userId, ['id', 'blocked_users']),
            messageRepository.findUserAttributes(destinataire_id, ['id', 'blocked_users']),
        ]);
        if (!recipient) return { outcome: 'rejected', status: 404, message: 'Destinataire introuvable' };
        if (isBlockedPair(sender, recipient)) {
            return { outcome: 'rejected', status: 403, message: 'Conversation impossible : utilisateur bloqué.' };
        }

        // Chercher une conversation existante entre les deux
        const existing = await messageRepository.findParticipationsRaw([userId, destinataire_id]);
        const convUsers = {};
        existing.forEach(p => {
            if (!convUsers[p.conversation_id]) convUsers[p.conversation_id] = new Set();
            convUsers[p.conversation_id].add(String(p.user_id));
        });

        let sharedConvId = null;
        for (const id of Object.keys(convUsers)) {
            if (convUsers[id].has(String(userId)) && convUsers[id].has(String(destinataire_id))) {
                const totalParticipants = await messageRepository.countParticipants(id);
                if (totalParticipants === 2) {
                    sharedConvId = id;
                    break;
                }
            }
        }

        if (sharedConvId) {
            const conv = await messageRepository.findConversationWithOtherParticipant(sharedConvId, userId);
            return { outcome: 'found', status: 200, conversation: conv };
        }

        // Créer une nouvelle conversation
        const newConv = await messageRepository.createConversation({ dernier_message: '', date_dernier_message: new Date() });
        await messageRepository.bulkCreateParticipants([
            { conversation_id: newConv.id, user_id: userId },
            { conversation_id: newConv.id, user_id: destinataire_id }
        ]);

        const conv = await messageRepository.findConversationWithOtherParticipant(newConv.id, userId);
        return { outcome: 'created', status: 201, conversation: conv };
    },

    // 5. Marquer une conversation comme lue
    async markAsRead(conversationId, userId) {
        await messageRepository.markMessagesRead(conversationId, userId);
        return { success: true };
    },

    // 6. Nombre de messages non lus
    async getUnreadCount(userId) {
        // Trouver les conversations de l'utilisateur
        const participations = await messageRepository.findParticipantsForUsers([userId]);
        const convIds = participations.map(p => p.conversation_id);
        if (!convIds.length) return { count: 0 };

        const count = await messageRepository.countUnread(convIds, userId);
        return { count };
    },

    // 7. Envoyer un message
    async sendMessage(body, file, user, io) {
        const { destinataire_id, contenu, conversation_id } = body;
        const t = await sequelize.transaction();
        try {
            // Partage de produit (bouton "Chat" sur une fiche produit) — situe
            // immédiatement le marchand sur l'article concerné, comme sur Alibaba.
            let productContext = null;
            if (body.product_context) {
                try {
                    const parsed = typeof body.product_context === 'string' ? JSON.parse(body.product_context) : body.product_context;
                    if (parsed?.id) productContext = parsed;
                } catch { /* ignoré si mal formé */ }
            }

            const resolveRecipientId = async (convId, explicitRecipientId) => {
                if (explicitRecipientId) return explicitRecipientId;
                const other = await messageRepository.findOtherParticipant(convId, user.id, { transaction: t });
                return other?.user_id || null;
            };

            // Déterminer le type et le contenu
            let msgType = 'text';
            let msgContenu = contenu || '';
            let metadata = null;

            if (file) {
                const mime = file.mimetype;
                const fileUrl = `/uploads/messages/${file.filename}`;
                let fileTypeCategory = 'file';

                if (mime.startsWith('image/')) {
                    fileTypeCategory = 'image';
                } else if (mime.startsWith('audio/')) {
                    fileTypeCategory = 'audio';
                } else if (mime.startsWith('video/')) {
                    fileTypeCategory = 'video';
                }

                msgType = fileTypeCategory;
                // If there's no text content, we can just leave contenu empty or use a placeholder, but it is required (allowNull: false).
                msgContenu = contenu || fileUrl;

                metadata = {
                    file_url: fileUrl,
                    file_name: file.originalname,
                    file_size: file.size,
                    mimeType: mime
                };
            } else if (productContext) {
                msgType = 'product';
                msgContenu = contenu || `Question à propos de : ${productContext.nom_produit || 'un produit'}`;
                metadata = { product: productContext };
            }

            if (!msgContenu) {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: 'Contenu ou fichier requis' };
            }

            let convId = conversation_id;
            let recipientId = destinataire_id || null;

            if (!convId) {
                if (!destinataire_id) {
                    await t.rollback();
                    return { outcome: 'rejected', status: 400, message: 'destinataire_id requis' };
                }
                if (destinataire_id === user.id) {
                    await t.rollback();
                    return { outcome: 'rejected', status: 400, message: 'Impossible de s\'envoyer un message à soi-même' };
                }
                const existingParticipants = await messageRepository.findParticipationsRaw([user.id, destinataire_id], { transaction: t });
                const convUsers = {};
                existingParticipants.forEach(p => {
                    if (!convUsers[p.conversation_id]) convUsers[p.conversation_id] = new Set();
                    convUsers[p.conversation_id].add(String(p.user_id));
                });

                let sharedConvId = null;
                for (const id of Object.keys(convUsers)) {
                    if (convUsers[id].has(String(user.id)) && convUsers[id].has(String(destinataire_id))) {
                        const totalParticipants = await messageRepository.countParticipants(id, { transaction: t });
                        if (totalParticipants === 2) {
                            sharedConvId = id;
                            break;
                        }
                    }
                }

                if (sharedConvId) {
                    convId = sharedConvId;
                    recipientId = destinataire_id;
                } else {
                    const newConv = await messageRepository.createConversation({
                        dernier_message: msgType === 'text' ? msgContenu : `[ ${msgType} ]`,
                        date_dernier_message: new Date()
                    }, { transaction: t });
                    await messageRepository.bulkCreateParticipants([
                        { conversation_id: newConv.id, user_id: user.id },
                        { conversation_id: newConv.id, user_id: destinataire_id }
                    ], { transaction: t });
                    convId = newConv.id;
                    recipientId = destinataire_id;
                }
            } else {
                const participation = await messageRepository.findParticipant(convId, user.id, { transaction: t });
                if (!participation) {
                    await t.rollback();
                    return { outcome: 'rejected', status: 403, message: 'Non autorisé pour cette conversation' };
                }
                recipientId = await resolveRecipientId(convId, recipientId);
            }

            if (recipientId) {
                const [sender, recipient] = await Promise.all([
                    messageRepository.findUserAttributes(user.id, ['id', 'blocked_users'], { transaction: t }),
                    messageRepository.findUserAttributes(recipientId, ['id', 'blocked_users'], { transaction: t }),
                ]);
                if (recipient && isBlockedPair(sender, recipient)) {
                    await t.rollback();
                    return { outcome: 'rejected', status: 403, message: 'Message impossible : utilisateur bloqué.' };
                }
            }

            const message = await messageRepository.createMessage({
                conversation_id: convId,
                expediteur_id: user.id,
                contenu: msgContenu,
                type: msgType,
                file_url: metadata?.file_url || null,
                file_name: metadata?.file_name || null,
                file_size: metadata?.file_size || null,
                metadata // keep metadata just in case
            }, { transaction: t });

            const preview = msgType === 'product'
                ? `📦 ${productContext?.nom_produit || 'Produit partagé'}`
                : msgType === 'text' ? msgContenu : `[ ${msgType} ]`;
            await messageRepository.updateConversationPreview(convId, {
                dernier_message: preview,
                date_dernier_message: new Date()
            }, { transaction: t });

            await t.commit();

            const payload = { message: message.toJSON(), conversation_id: convId };
            if (io) {
                if (recipientId) io.to(String(recipientId)).emit('new_message', payload);
                io.to(`conv_${convId}`).emit('new_message', payload);
            }

            return { outcome: 'sent', message };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    // 8. Supprimer une conversation (masquage côté utilisateur uniquement)
    async deleteConversation(conversationId, userId) {
        const participant = await messageRepository.findParticipant(conversationId, userId);
        if (!participant) return { outcome: 'rejected', status: 403, message: 'Non autorisé' };

        participant.est_invisible = true;
        await messageRepository.saveParticipant(participant);

        return { outcome: 'deleted' };
    },

    // 9. Bloquer l'autre participant d'une conversation
    async blockUser(conversationId, userId) {
        const participant = await messageRepository.findParticipant(conversationId, userId);
        if (!participant) return { outcome: 'rejected', status: 403, message: 'Non autorisé' };

        const other = await messageRepository.findOtherParticipant(conversationId, userId);
        if (!other) return { outcome: 'rejected', status: 404, message: 'Aucun autre participant à bloquer.' };

        const user = await messageRepository.findUserById(userId);
        const blocked = new Set(Array.isArray(user.blocked_users) ? user.blocked_users : []);
        blocked.add(other.user_id);
        user.blocked_users = [...blocked];
        await messageRepository.saveUser(user);

        return { outcome: 'blocked' };
    }
};

module.exports = messageService;
