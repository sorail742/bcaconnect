import { useQuery } from '@tanstack/react-query';
import aiService from '../services/aiService';

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
