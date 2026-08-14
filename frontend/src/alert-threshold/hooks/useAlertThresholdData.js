import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import alertThresholdService from '../services/alertThresholdService';

export const useMyAlertThresholds = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['alert-thresholds-mine'],
        queryFn: alertThresholdService.getMine,
        staleTime: 30_000,
        enabled: !!token && isAuthenticated,
    });
    return { data: data || [], loading, refetch };
};

export const useCreateOrUpdateAlertThreshold = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: alertThresholdService.createOrUpdate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alert-thresholds-mine'] });
            toast.success('Alerte enregistrée. Vous serez notifié dès que le seuil est atteint.');
        },
        onError: (e) => toast.error(e.response?.data?.message || "Impossible d'enregistrer cette alerte."),
    });
};

export const useToggleAlertThreshold = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, actif }) => alertThresholdService.toggle(id, actif),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alert-thresholds-mine'] }),
        onError: () => toast.error("Impossible de modifier cette alerte."),
    });
};

export const useDeleteAlertThreshold = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => alertThresholdService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alert-thresholds-mine'] });
            toast.success('Alerte supprimée.');
        },
        onError: () => toast.error("Impossible de supprimer cette alerte."),
    });
};
