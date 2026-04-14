import { useQuery } from '@tanstack/react-query';
import orderService from '../../services/orderService';

export const useOrders = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['orders'],
        queryFn: () => orderService.getAll(),
        staleTime: 30_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useOrderById = (id) => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderService.getById(id),
        staleTime: 30_000,
        enabled: !!id,
    });
    return { data, loading, error: error?.message || null, isFetching };
};

export const useVendorOrders = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['vendor-orders'],
        queryFn: () => orderService.getVendorOrders(),
        staleTime: 30_000,
    });
    return { data, loading, error: error?.message || null, isFetching };
};
