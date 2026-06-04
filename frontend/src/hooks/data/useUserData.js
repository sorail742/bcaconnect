import { useQuery } from '@tanstack/react-query';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';
import messageService from '../../services/messageService';
import useAuthStore from '../../store/authStore';

/**
 * useUserProfile — Profil de l'utilisateur connecté.
 */
export const useUserProfile = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['user-profile'],
        queryFn: () => authService.getCurrentUser(),
        staleTime: 2 * 60_000,
        enabled: !!token && isAuthenticated,
    });
    return { data: data?.user || data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

/**
 * useNotificationsList — Liste des notifications.
 */
export const useNotificationsList = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getAll(),
        staleTime: 30_000,
        enabled: !!token && isAuthenticated,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

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
    return { data: data || [], loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
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
    return { data: data || [], loading, error: error?.message || null, refetch, isFetching };
};
