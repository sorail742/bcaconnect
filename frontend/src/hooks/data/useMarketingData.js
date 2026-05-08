import { useQuery } from '@tanstack/react-query';
import adService from '../../services/adService';

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
