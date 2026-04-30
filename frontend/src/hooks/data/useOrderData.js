import { useQuery } from '@tanstack/react-query';
import orderService from '../../services/orderService';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../constants/roles';

export const useOrders = () => {
    const { user, token, isAuthenticated } = useAuthStore();
    
    // 🛡️ Vérification de rôle ultra-sécurisée (insensible à la casse)
    const isAdmin = user?.role?.toLowerCase() === ROLES.ADMIN;

    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['orders', user?.id, isAdmin],
        queryFn: () => isAdmin ? orderService.getAllAdmin() : orderService.getAll(),
        staleTime: 30_000,
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
        enabled: !!id && !!token && isAuthenticated,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

export const useVendorOrders = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['vendor-orders'],
        queryFn: () => orderService.getVendorOrders(),
        staleTime: 30_000,
        enabled: !!token && isAuthenticated,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};
