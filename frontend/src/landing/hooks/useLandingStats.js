import { useQuery } from '@tanstack/react-query';
import statService from '../../dashboard/services/statService';
import { normalizeLandingStats, DEFAULT_STATS } from '../lib/landingStats';

export function useLandingStats() {
    const query = useQuery({
        queryKey: ['stats', 'landing'],
        queryFn: () => statService.getLandingStats(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const stats = query.data ? normalizeLandingStats(query.data) : { ...DEFAULT_STATS };

    return {
        stats,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
