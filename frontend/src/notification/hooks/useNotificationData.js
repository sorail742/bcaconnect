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
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};
