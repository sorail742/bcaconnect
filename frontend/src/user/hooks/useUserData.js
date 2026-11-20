import { useQuery } from '@tanstack/react-query';
import authService from '../../auth/services/authService';
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
