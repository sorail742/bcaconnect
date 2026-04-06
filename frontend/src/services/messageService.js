import api from './api';

const messageService = {
    getConversations: async () => {
        try {
            const response = await api.get('/messages/conversations');
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },

    getMessages: async (conversationId) => {
        try {
            if (!conversationId) return [];
            const response = await api.get(`/messages/${conversationId}/messages`);
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },

    // Supporte texte seul ou fichier (image, document, audio)
    sendMessage: async ({ destinataire_id, contenu, conversation_id, file }) => {
        if (file) {
            const form = new FormData();
            if (conversation_id) form.append('conversation_id', conversation_id);
            if (destinataire_id) form.append('destinataire_id', destinataire_id);
            if (contenu) form.append('contenu', contenu);
            form.append('file', file);
            const response = await api.post('/messages/send', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        }
        const response = await api.post('/messages/send', { destinataire_id, contenu, conversation_id });
        return response.data;
    },

    startConversation: async (destinataireId) => {
        const response = await api.post('/messages/conversations/start', { destinataire_id: destinataireId });
        return response.data;
    },

    markAsRead: async (conversationId) => {
        try {
            await api.patch(`/messages/${conversationId}/read`);
        } catch { /* silent */ }
    },

    getUnreadCount: async () => {
        try {
            const response = await api.get('/messages/unread-count');
            return response.data?.count || 0;
        } catch {
            return 0;
        }
    }
};

export default messageService;
