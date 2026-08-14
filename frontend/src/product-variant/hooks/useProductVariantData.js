import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productVariantService from '../services/productVariantService';
import { toast } from 'sonner';

const EMPTY_ARRAY = [];

export const useProductVariants = (productId) => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['product-variants', productId],
        queryFn: () => productVariantService.getForProduct(productId),
        enabled: !!productId,
        staleTime: 20_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch };
};

export const useCreateProductVariant = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => productVariantService.create(productId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
            toast.success('Variante ajoutée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible de créer la variante.'),
    });
};

export const useUpdateProductVariant = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => productVariantService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
            toast.success('Variante mise à jour.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Mise à jour impossible.'),
    });
};

export const useRemoveProductVariant = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => productVariantService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
            toast.success('Variante supprimée.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Suppression impossible.'),
    });
};
