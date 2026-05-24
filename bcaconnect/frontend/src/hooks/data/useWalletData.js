import { useQuery } from '@tanstack/react-query';
import walletService from '../../services/walletService';
import useAuthStore from '../../store/authStore';

export const useWallet = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['wallet'],
        queryFn: () => walletService.getWallet(),
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
    });
    return { data, loading, error: error?.message || null, mutate: refetch, refetch, isFetching };
};

export const useWalletTransactions = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['wallet-transactions'],
        queryFn: () => walletService.getTransactions(),
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

export const useAllTransactions = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['all-transactions'],
        queryFn: () => walletService.getAllTransactions(),
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};
