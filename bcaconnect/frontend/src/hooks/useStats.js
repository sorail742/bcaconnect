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
    return useQuery({
        queryKey: ['stats', 'financial'],
        queryFn: () => statService.getFinancialStats(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: true,
    });
};

export const useVendorStats = () => {
    return useQuery({
        queryKey: ['stats', 'vendor'],
        queryFn: () => statService.getVendorStats(),
        staleTime: 3 * 60 * 1000, // 3 minutes
    });
};

export const useTrends = (params = {}) => {
    return useQuery({
        queryKey: ['stats', 'trends', params],
        queryFn: () => statService.getTrends(params),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
