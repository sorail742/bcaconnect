import api from './api';

const messageService = {
    getConversations: async () => {
        try {
            const response = await api.get('/messages/conversations');
            return response.data;
        } catch (error) {
            console.error('Erreur chargement conversations:', error);
            return [];
        }
    },

    getMessages: async (conversationId) => {
        try {
            if (!conversationId) return [];
            const response = await api.get(`/messages/${conversationId}/messages`);
            return response.data;
        } catch (error) {
            console.error('Erreur chargement messages:', error);
            return [];
        }
    },

    sendMessage: async (data) => {
        try {
            // data: { destinataire_id, contenu, conversation_id }
            const response = await api.post('/messages/send', data);
            return response.data;
        } catch (error) {
            console.error('Erreur envoi message:', error);
            throw error;
        }
    }
};

export default messageService;
