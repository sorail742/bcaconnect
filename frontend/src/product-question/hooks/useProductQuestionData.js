import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productQuestionService from '../services/productQuestionService';
import { toast } from 'sonner';

const EMPTY_ARRAY = [];

export const useProductQuestions = (productId) => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['product-questions', productId],
        queryFn: () => productQuestionService.getForProduct(productId),
        enabled: !!productId,
        staleTime: 20_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch };
};

export const usePendingVendorQuestions = () => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['product-questions-pending'],
        queryFn: () => productQuestionService.getPendingForVendor(),
        staleTime: 20_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch };
};

export const useAskProductQuestion = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (question) => productQuestionService.ask(productId, question),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
            toast.success('Question publiée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible de publier la question.'),
    });
};

export const useAnswerProductQuestion = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reponse }) => productQuestionService.answer(id, reponse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
            queryClient.invalidateQueries({ queryKey: ['product-questions-pending'] });
            toast.success('Réponse publiée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible de répondre.'),
    });
};

export const useMarkQuestionHelpful = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => productQuestionService.markHelpful(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-questions', productId] }),
    });
};

export const useRemoveProductQuestion = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => productQuestionService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
            toast.success('Question supprimée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Suppression impossible.'),
    });
};
