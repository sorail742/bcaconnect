import { useQuery } from '@tanstack/react-query';
import walletService from '../../services/walletService';

export const useWallet = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['wallet'],
        queryFn: () => walletService.getWallet(),
        staleTime: 0, // Les données financières doivent être fraîches
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useWalletTransactions = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['wallet-transactions'],
        queryFn: () => walletService.getTransactions(),
        staleTime: 5 * 60_000,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

export const useAllTransactions = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['all-transactions'],
        queryFn: () => walletService.getAllTransactions(),
        staleTime: 30_000,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};
