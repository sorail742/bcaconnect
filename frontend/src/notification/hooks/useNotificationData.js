import { useQuery } from '@tanstack/react-query';
import notificationService from '../services/notificationService';
import useAuthStore from '../../store/authStore';

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
        // networkMode 'online' (par défaut) met la requête en pause hors
        // ligne et n'appelle jamais queryFn — ce qui empêche
        // notificationService.getAll() d'atteindre son fallback
        // offlineStorage.getNotifications() (cahier des charges 3.6, même
        // correctif que useProducts pour 1.12).
        networkMode: 'always',
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};
