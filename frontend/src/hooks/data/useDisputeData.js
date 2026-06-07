import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import disputeService from '../../services/disputeService';
import { toast } from 'sonner';

export const useDispute = (id) => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['dispute', id],
        queryFn: () => disputeService.getById(id),
        enabled: !!id,
        staleTime: 15_000,
    });
    return { data: data || null, loading, error: error?.message || null, refetch, isFetching };
};

export const useRespondDispute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, message }) => disputeService.respond(id, message),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['dispute', id] });
            queryClient.invalidateQueries({ queryKey: ['my-disputes'] });
            toast.success('Réponse envoyée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Erreur lors de l\'envoi.'),
    });
};

export const useAcceptDisputeProposal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => disputeService.acceptProposal(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['dispute', id] });
            queryClient.invalidateQueries({ queryKey: ['my-disputes'] });
            toast.success('Proposition IA acceptée — litige résolu.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible d\'accepter.'),
    });
};

export const useEscalateDispute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, motif }) => disputeService.escalate(id, motif),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['dispute', id] });
            queryClient.invalidateQueries({ queryKey: ['my-disputes'] });
            toast.success('Litige escaladé vers l\'administration.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible d\'escalader.'),
    });
};
