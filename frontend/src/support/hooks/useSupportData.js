import { useQuery } from '@tanstack/react-query';
import supportService from '../services/supportService';

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
