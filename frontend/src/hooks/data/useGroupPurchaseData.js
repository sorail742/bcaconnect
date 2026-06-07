import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import groupPurchaseService from '../../services/groupPurchaseService';
import { toast } from 'sonner';

export const useGroupPurchases = (params = {}) => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['group-purchases', params],
        queryFn: () => groupPurchaseService.list(params),
        staleTime: 30_000,
    });
    return { data: data || [], loading, error: error?.message || null, refetch, isFetching };
};

export const useGroupPurchase = (id) => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['group-purchase', id],
        queryFn: () => groupPurchaseService.getById(id),
        enabled: !!id,
        staleTime: 15_000,
    });
    return { data: data || null, loading, error: error?.message || null, refetch };
};

export const useCreateGroupPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => groupPurchaseService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-purchases'] });
            toast.success('Campagne d\'achat groupé créée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Erreur lors de la création.'),
    });
};

export const useJoinGroupPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, quantite }) => groupPurchaseService.join(id, quantite),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['group-purchases'] });
            toast.success(res?.message || 'Participation enregistrée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible de rejoindre la campagne.'),
    });
};

export const useLeaveGroupPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => groupPurchaseService.leave(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-purchases'] });
            toast.success('Participation annulée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible d\'annuler.'),
    });
};

export const useCloseGroupPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => groupPurchaseService.close(id),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['group-purchases'] });
            toast.success(res?.message || 'Campagne clôturée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible de clôturer.'),
    });
};
