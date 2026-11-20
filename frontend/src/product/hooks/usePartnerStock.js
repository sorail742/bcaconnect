import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import partnerStockService from '../services/partnerStockService';

/**
 * usePartnerStock — Stock partenaire/entrepôt tiers d'un produit (cahier des charges 2.5).
 */
export const usePartnerStockTotal = (produitId, { enabled = true } = {}) => {
    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['partner-stock-total', produitId],
        queryFn: () => partnerStockService.getTotalStock(produitId),
        enabled: !!produitId && enabled,
        staleTime: 30_000,
    });
    return { data, loading, refetch };
};

export const useCreatePartnerStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ produitId, ...payload }) => partnerStockService.create(produitId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['partner-stock-total', variables.produitId] });
            toast.success('Entrée de stock partenaire ajoutée.');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Impossible d'ajouter cette entrée.");
        },
    });
};

export const useDeletePartnerStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => partnerStockService.delete(id),
        onSuccess: (_data, variables) => {
            if (variables.produitId) {
                queryClient.invalidateQueries({ queryKey: ['partner-stock-total', variables.produitId] });
            }
            toast.success('Entrée de stock partenaire supprimée.');
        },
        onError: () => {
            toast.error('Impossible de supprimer cette entrée.');
        },
    });
};
