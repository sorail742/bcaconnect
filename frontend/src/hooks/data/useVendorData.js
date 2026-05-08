import { useQuery } from '@tanstack/react-query';
import storeService from '../../services/storeService';
import statService from '../../services/statService';

export const useVendors = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['vendors'],
        queryFn: () => storeService.getAll(),
        staleTime: 5 * 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useMyStore = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['my-store'],
        queryFn: () => storeService.getMyStore(),
        staleTime: 2 * 60_000,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

export const useVendorById = (id) => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['vendor', id],
        queryFn: () => storeService.getById(id),
        staleTime: 2 * 60_000,
        enabled: !!id,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useVendorBySlug = (slug) => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['vendor-slug', slug],
        queryFn: () => storeService.getBySlug(slug),
        staleTime: 2 * 60_000,
        enabled: !!slug,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useVendorStats = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['vendor-stats'],
        queryFn: () => statService.getVendorStats(),
        staleTime: 60_000, // Durcissement: 1 min pour les stats vendeur
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};


