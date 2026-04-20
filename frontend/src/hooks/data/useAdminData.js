import { useQuery } from '@tanstack/react-query';
import statService from '../../services/statService';
import deliveryService from '../../services/deliveryService';
import api from '../../services/api';

export const useStats = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['stats-global'],
        queryFn: () => statService.getAdminStats(),
        staleTime: 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useDeliveries = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['deliveries'],
        queryFn: () => deliveryService.getMyDeliveries(),
        staleTime: 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useAdminDisputes = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['admin-disputes'],
        queryFn: () => api.get('/disputes/admin').then(r => r.data),
        staleTime: 60_000,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

export const useTrends = (params = {}) => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['trends', params],
        queryFn: () => statService.getTrends(params),
        staleTime: 60_000,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

export const useFinancialStats = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['stats-financial'],
        queryFn: () => statService.getFinancialStats(),
        staleTime: 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};
