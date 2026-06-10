import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import deliveryService from '../../services/deliveryService';
import { toast } from 'sonner';

export const useAvailableDeliveries = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['available-deliveries'],
        queryFn: () => deliveryService.getAvailableOrders(),
        staleTime: 5_000,
        refetchOnWindowFocus: true,
    });
    return { data: data || [], isLoading, error: error?.message || null, refetch, isFetching };
};

export const useMyDeliveries = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['my-deliveries'],
        queryFn: () => deliveryService.getMyDeliveries(),
        staleTime: 5_000,
        refetchOnWindowFocus: true,
    });
    return { data: data || [], isLoading, error: error?.message || null, refetch, isFetching };
};

export const useCompletedDeliveries = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['completed-deliveries'],
        queryFn: () => deliveryService.getCompletedDeliveries(),
        staleTime: 5_000,
        refetchOnWindowFocus: true,
    });
    return { data: data || [], isLoading, error: error?.message || null, refetch, isFetching };
};

export const useJourneyHistory = (orderId) => {
    return useQuery({
        queryKey: ['journey-history', orderId],
        queryFn: () => deliveryService.getHistory(orderId),
        enabled: !!orderId,
        refetchInterval: orderId ? 15_000 : false,
        staleTime: 10_000,
    });
};

export const useMyGroups = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['my-groups'],
        queryFn: () => deliveryService.getMyGroups(),
        staleTime: 5_000,
        refetchOnWindowFocus: true,
    });
    return { data: data || [], isLoading, error: error?.message || null, refetch, isFetching };
};

export const useGroupOrders = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderIds) => deliveryService.groupOrders(orderIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['available-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['my-groups'] });
            toast.success("LIVRAISONS REGROUPÉES AVEC SUCCÈS.");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "ERREUR LORS DU REGROUPEMENT.");
        }
    });
};

export const useAssignDelivery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId) => deliveryService.assignOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['available-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['carrier-stats'] });
            toast.success("MISSION ASSIGNÉE. VEUILLEZ RAMASSER LE COLIS.");
        },
        onError: () => {
            toast.error("ERREUR D'ASSIGNATION TACTIQUE.");
        }
    });
};

export const useUpdateTracking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (trackingData) => deliveryService.updateTracking(trackingData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
        },
        onError: () => {
            toast.error("ERREUR DE MISE À JOUR DU FLUX.");
        }
    });
};

export const useVerifyDelivery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, otp }) => deliveryService.verifyDelivery(orderId, otp),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['carrier-stats'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
            toast.success("LIVRAISON RÉUSSIE ET VALIDÉE !");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "ERREUR DE VALIDATION OTP.");
        }
    });
};

export const useCarrierStats = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['carrier-stats'],
        queryFn: () => deliveryService.getCarrierStats(),
        staleTime: 5_000,
        refetchOnWindowFocus: true,
    });
    return { data, isLoading, error: error?.message || null, refetch, isFetching };
};

export const useAdminLogistics = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['admin-logistics'],
        queryFn: () => deliveryService.getAdminOverview(),
        staleTime: 30_000,
        refetchInterval: 30_000,
    });
    return { data, isLoading, error: error?.message || null, refetch, isFetching };
};
