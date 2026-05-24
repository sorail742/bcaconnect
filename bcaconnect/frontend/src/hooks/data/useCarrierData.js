import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import deliveryService from '../../services/deliveryService';
import { toast } from 'sonner';

export const useAvailableDeliveries = () => {
    return useQuery({
        queryKey: ['available-deliveries'],
        queryFn: () => deliveryService.getAvailableOrders(),
        staleTime: 30_000, // 30 secondes pour les offres libres
    });
};

export const useMyDeliveries = () => {
    return useQuery({
        queryKey: ['my-deliveries'],
        queryFn: () => deliveryService.getMyDeliveries(),
        staleTime: 60_000,
    });
};

export const useAssignDelivery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId) => deliveryService.assignOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['available-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
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
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] }); // Pour le vendeur si concerné
            toast.success("LIVRAISON RÉUSSIE ET VALIDÉE !");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "ERREUR DE VALIDATION OTP.");
        }
    });
};
