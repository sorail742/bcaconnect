import { useQuery } from '@tanstack/react-query';
import statService from '../services/statService';

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['stats', 'admin'],
        queryFn: () => statService.getAdminStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
    });
};

export const useFinancialStats = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['stats-financial'],
        queryFn: () => statService.getFinancialStats(),
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

export const useAiLogs = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['ai-logs'],
        queryFn: () => statService.getAiLogs(),
        refetchInterval: 10_000, // rafraîchissement auto des logs
        staleTime: 5_000,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};
