import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import savService from '../../services/savService';
import { toast } from 'sonner';

export const useMyGuarantees = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['my-guarantees'],
        queryFn: () => savService.getMyGuarantees(),
        staleTime: 60_000,
    });
    return { data: data || [], loading: isLoading, error: error?.message, refetch };
};

export const useMyInterventions = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['my-interventions'],
        queryFn: () => savService.getMyInterventions(),
        staleTime: 30_000,
    });
    return { data: data || [], loading: isLoading, error: error?.message, refetch };
};

export const useRequestIntervention = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => savService.requestIntervention(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-interventions'] });
            toast.success('Demande SAV envoyée — un technicien sera assigné.');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la demande.');
        },
    });
};
