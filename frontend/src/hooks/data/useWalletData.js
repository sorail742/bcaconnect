import { useQuery } from '@tanstack/react-query';
import walletService from '../../services/walletService';
import useAuthStore from '../../store/authStore';

export const useWallet = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['wallet'],
        queryFn: () => walletService.getWallet(),
        staleTime: 0,
        enabled: !!token && isAuthenticated, // 🛡️ Verrou d'Authentification
    });
    return { data, loading, error: error?.message || null, mutate: refetch, refetch, isFetching };
};

export const useWalletTransactions = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['wallet-transactions'],
        queryFn: () => walletService.getTransactions(),
        staleTime: 5 * 60_000,
        enabled: !!token && isAuthenticated, // 🛡️ Verrou d'Authentification
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
