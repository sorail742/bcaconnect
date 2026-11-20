import { useQuery } from '@tanstack/react-query';
import messageService from '../services/messageService';
import useAuthStore from '../../store/authStore';

// Référence stable : `data || []` recrée un nouveau tableau à CHAQUE rendu tant que la
// requête n'a pas résolu, ce qui casse les `useEffect` qui dépendent de `data` (ex:
// Messages.jsx synchronisant en state local) — boucle de rendu infinie ("Maximum update
// depth exceeded"). En retombant sur cette même référence figée, `data` ne change
// d'identité que lorsque son contenu change réellement.
const EMPTY_ARRAY = [];

/**
 * useMessages — Conversations de l'utilisateur.
 */
export const useMessages = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => messageService.getConversations(),
        staleTime: 15_000,
        enabled: !!token && isAuthenticated,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

/**
 * useConversationMessages — Messages d'une conversation.
 */
export const useConversationMessages = (conversationId) => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['conversation-messages', conversationId],
        queryFn: () => messageService.getMessages(conversationId),
        staleTime: 10_000,
        enabled: !!token && isAuthenticated && !!conversationId,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch, isFetching };
};
