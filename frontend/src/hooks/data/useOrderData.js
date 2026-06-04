import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orderService from '../../services/orderService';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../constants/roles';
import { toast } from 'sonner';

export const useOrders = () => {
    const { user, token, isAuthenticated } = useAuthStore();
    const isAdmin = user?.role?.toLowerCase() === ROLES.ADMIN;

    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['orders', user?.id, isAdmin],
        queryFn: async () => {
            const res = isAdmin ? await orderService.getAllAdmin() : await orderService.getAll();
            return Array.isArray(res) ? { orders: res, total: res.length } : res;
        },
        staleTime: 30_000,
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
        enabled: !!token && isAuthenticated,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

export const useOrderById = (id) => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderService.getById(id),
        staleTime: 30_000,
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
        enabled: !!id && !!token && isAuthenticated,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

export const useVendorOrders = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['vendor-orders'],
        queryFn: async () => {
            const res = await orderService.getVendorOrders();
            return Array.isArray(res) ? { orders: res, total: res.length } : res;
        },
        staleTime: 30_000,
        enabled: !!token && isAuthenticated,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

/**
 * useUpdateOrderStatus — Mutation pour changer le statut d'un item de commande.
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => orderService.updateItemStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-stats'] });
            toast.success(`STATUT_MIS_À_JOUR_ALPHA : ${variables.status.toUpperCase()}`);
        },
        onError: () => {
            toast.error("ERREUR_MISE_À_JOUR_STATUT_SYSTÈME.");
        }
    });
};
