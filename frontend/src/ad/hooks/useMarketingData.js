import { useQuery } from '@tanstack/react-query';
import adService from '../services/adService';
import useAuthStore from '../../store/authStore';

export const useAds = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['ads-active'],
        queryFn: () => adService.getActive(),
        staleTime: 10 * 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useHeroSlides = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['hero-slides'],
        queryFn: () => adService.getHeroSlides(),
        staleTime: 10 * 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useAdminAds = () => {
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['ads-admin'],
        queryFn: () => adService.getAll(),
        staleTime: 60_000,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

export const useAdsManagement = () => {
    const { user, token, isAuthenticated } = useAuthStore();
    const isVendor = user?.role === 'fournisseur';

    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['ads-management', user?.role],
        queryFn: () => (isVendor ? adService.getMine() : adService.getAll()),
        staleTime: 60_000,
        enabled: !!token && isAuthenticated,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching, isVendor };
};
