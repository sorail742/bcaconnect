import { useQuery } from '@tanstack/react-query';
import supportService from '../../services/supportService';
import aiService from '../../services/aiService';
import api from '../../services/api';

/**
 * useTickets — Support technique / tickets.
 */
export const useTickets = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['tickets'],
        queryFn: () => supportService.getMyTickets(),
        staleTime: 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

/**
 * useMyDisputes — Litiges de l'utilisateur.
 */
export const useMyDisputes = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['my-disputes'],
        queryFn: () => api.get('/disputes/my').then(r => r.data),
        staleTime: 60_000,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

/**
 * useTrustScore — Score de confiance IA.
 */
export const useTrustScore = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['trust-score'],
        queryFn: () => aiService.getTrustAnalysis(),
        staleTime: 10 * 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};
