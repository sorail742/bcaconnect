import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import iotService from '../services/iotService';

export const useIotTracking = (orderId, enabled = true) => {
    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['iot-tracking', orderId],
        queryFn: () => iotService.getTracking(orderId),
        enabled: !!orderId && enabled,
        staleTime: 15_000,
        retry: false,
    });
    return { data, loading, refetch };
};

export const useActivateIot = (orderId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => iotService.activate(orderId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['iot-tracking', orderId] });
            toast.success('Suivi IoT activé.');
        },
        onError: (e) => toast.error(e.response?.data?.message || "Impossible d'activer le suivi IoT."),
    });
};

export const useDeactivateIot = (orderId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => iotService.deactivate(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['iot-tracking', orderId] });
            toast.success('Suivi IoT désactivé.');
        },
        onError: () => toast.error('Impossible de désactiver le suivi IoT.'),
    });
};
