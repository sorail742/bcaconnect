import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import walletService from '../services/walletService';
import useAuthStore from '../../store/authStore';

export const useWallet = () => {
    const { isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['wallet'],
        queryFn: () => walletService.getWallet(),
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
        enabled: !!isAuthenticated,
    });
    return { data, loading, error: error?.message || null, mutate: refetch, refetch, isFetching };
};

export const useWalletTransactions = () => {
    const { isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['wallet-transactions'],
        queryFn: () => walletService.getTransactions(),
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
        enabled: !!isAuthenticated,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

export const useAllTransactions = (params = {}) => {
    const { isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['all-transactions', params],
        queryFn: () => walletService.getAllTransactions(params),
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
        enabled: !!isAuthenticated,
    });
    return { data, loading, error: error?.message || null, refetch, isFetching };
};

/**
 * usePendingWithdrawals — Demandes de retrait en attente (banque / admin).
 */
export const usePendingWithdrawals = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['pending-withdrawals'],
        queryFn: () => walletService.getPendingWithdrawals(),
        staleTime: 15_000,
    });
    return { data: Array.isArray(data) ? data : [], loading, error: error?.message || null, refetch, isFetching };
};

/**
 * useProcessWithdrawal — Approuver ou refuser une demande de retrait.
 */
export const useProcessWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, action, notes_admin }) => walletService.processWithdrawal(id, action, notes_admin),
        onSuccess: (_, { action }) => {
            queryClient.invalidateQueries({ queryKey: ['pending-withdrawals'] });
            toast.success(action === 'approve' ? 'Retrait validé.' : 'Retrait refusé — solde restitué.');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Erreur lors du traitement du retrait.');
        },
    });
};
