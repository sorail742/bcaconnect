import api from '../../services/api';

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
        if (!conversationId) return [];
        const response = await api.get(`/messages/${conversationId}/messages`);
        return Array.isArray(response.data) ? response.data : [];
    },

    // Supporte texte seul, fichier (image, document, audio) ou partage de produit
    sendMessage: async ({ destinataire_id, contenu, conversation_id, file, product_context }) => {
        if (file) {
            const form = new FormData();
            if (conversation_id) form.append('conversation_id', conversation_id);
            if (destinataire_id) form.append('destinataire_id', destinataire_id);
            if (contenu) form.append('contenu', contenu);
            form.append('file', file);
            const response = await api.post('/messages/send', form);
            return response.data;
        }
        const response = await api.post('/messages/send', {
            destinataire_id,
            contenu,
            conversation_id,
            product_context: product_context || undefined,
        });
        return response.data;
    },

    /** Partage la fiche d'un produit dans une conversation (bouton "Chat" sur un produit). */
    shareProduct: async (destinataireId, product) => {
        const productContext = {
            id: product.id,
            nom_produit: product.nom_produit,
            image_url: product.image_url || product.images?.[0]?.url_image,
            prix_unitaire: product.prix_unitaire,
            slug: product.slug,
        };
        const response = await api.post('/messages/send', {
            destinataire_id: destinataireId,
            contenu: '',
            product_context: productContext,
        });
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

    getUnreadCount: async (config = {}) => {
        try {
            const response = await api.get('/messages/unread-count', { ...config });
            return response.data?.count || 0;
        } catch {
            return 0;
        }
    },

    deleteConversation: async (conversationId, confirmationText) => {
        const response = await api.delete(`/messages/conversations/${conversationId}`, { data: { confirmation_nom: confirmationText } });
        return response.data;
    },

    blockUser: async (conversationId) => {
        const response = await api.post(`/messages/conversations/${conversationId}/block`);
        return response.data;
    }
};

export default messageService;
