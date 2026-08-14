import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import rfqService from '../services/rfqService';
import { toast } from 'sonner';

const EMPTY_ARRAY = [];

export const useOpenRfqs = (params = {}) => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['rfq-open', params],
        queryFn: () => rfqService.getOpen(params),
        staleTime: 30_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch, isFetching };
};

export const useMyRfqs = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['rfq-mine'],
        queryFn: () => rfqService.getMine(),
        staleTime: 15_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch, isFetching };
};

export const useMyRfqQuotes = () => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['rfq-my-quotes'],
        queryFn: () => rfqService.getMyQuotes(),
        staleTime: 15_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch };
};

export const useRfqById = (id) => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['rfq', id],
        queryFn: () => rfqService.getById(id),
        enabled: !!id,
        staleTime: 10_000,
    });
    return { data: data || null, loading, error: error?.message || null, refetch };
};

export const useCreateRfq = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => rfqService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfq-mine'] });
            toast.success('Demande de devis publiée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Erreur lors de la publication.'),
    });
};

export const useSubmitRfqQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => rfqService.submitQuote(id, payload),
        onSuccess: (_res, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['rfq-open'] });
            queryClient.invalidateQueries({ queryKey: ['rfq-my-quotes'] });
            queryClient.invalidateQueries({ queryKey: ['rfq', id] });
            toast.success('Devis soumis avec succès.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible de soumettre le devis.'),
    });
};

export const useAcceptRfqQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, quoteId }) => rfqService.acceptQuote(id, quoteId),
        onSuccess: (_res, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['rfq-mine'] });
            queryClient.invalidateQueries({ queryKey: ['rfq', id] });
            toast.success('Devis accepté ! Une conversation a été ouverte.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible d\'accepter ce devis.'),
    });
};

export const useCloseRfq = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => rfqService.close(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfq-mine'] });
            toast.success('Demande fermée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible de fermer la demande.'),
    });
};
