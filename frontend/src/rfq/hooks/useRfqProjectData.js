import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import rfqProjectService from '../services/rfqProjectService';

export const useMyRfqProjects = () => {
    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['rfq-mine'],
        queryFn: rfqProjectService.getMine,
        staleTime: 30_000,
    });
    return { data: (data || []).filter((d) => d.type_demande === 'projet'), loading, refetch };
};

export const useOpenRfqProjects = () => {
    const { data, isLoading: loading } = useQuery({
        queryKey: ['rfq-open'],
        queryFn: rfqProjectService.getOpen,
        staleTime: 30_000,
    });
    return { data: (data || []).filter((d) => d.type_demande === 'projet'), loading };
};

export const useCreateRfqProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rfqProjectService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfq-mine'] });
            toast.success("Appel d'offres publié.");
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Impossible de publier cet appel d\'offres.'),
    });
};

export const useRfqComparison = (id) => {
    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['rfq-comparison', id],
        queryFn: () => rfqProjectService.getComparison(id),
        enabled: !!id,
    });
    return { data, loading, refetch };
};

export const useSubmitProjectQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }) => rfqProjectService.submitQuote(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfq-open'] });
            toast.success('Offre soumise.');
        },
        onError: (e) => toast.error(e.response?.data?.message || "Impossible de soumettre l'offre."),
    });
};

export const useAcceptProjectQuote = (id) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (quoteId) => rfqProjectService.acceptQuote(id, quoteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfq-comparison', id] });
            toast.success('Offre acceptée. Une conversation a été ouverte.');
        },
    });
};
