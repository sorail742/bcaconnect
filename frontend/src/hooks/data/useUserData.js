import { useQuery } from '@tanstack/react-query';
import userService from '../../services/userService';
import notificationService from '../../services/notificationService';
import messageService from '../../services/messageService';

/**
 * useUserProfile — Profil de l'utilisateur connecté.
 */
export const useUserProfile = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['user-profile'],
        queryFn: () => userService.getById('me'),
        staleTime: 2 * 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

/**
 * useNotificationsList — Liste des notifications.
 */
export const useNotificationsList = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getAll(),
        staleTime: 30_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

/**
 * useMessages — Conversations et chats.
 */
export const useMessages = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => messageService.getConversations(),
        staleTime: 15_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};
