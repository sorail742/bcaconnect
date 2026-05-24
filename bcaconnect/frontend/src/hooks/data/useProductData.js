import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

/**
 * useProducts — Lister les produits avec filtres serveur.
 */
export const useProducts = (params = {}) => {
    const paramsKey = JSON.stringify(params);
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['products', paramsKey],
        queryFn: () => productService.getAll(params),
        staleTime: 2 * 60_000,
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

/**
 * useProductById — Détail d'un produit.
 */
export const useProductById = (id) => {
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id),
        staleTime: 5 * 60_000,
        enabled: !!id,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

/**
 * useVendorProducts — Produits du vendeur connecté.
 */
export const useVendorProducts = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['vendor-products'],
        queryFn: () => productService.getMyProducts(),
        staleTime: 60_000,
        enabled: !!token && isAuthenticated,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

/**
 * useUpdateStock — Mutation pour modifier le stock.
 */
export const useUpdateStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, stock_quantite }) => productService.patchStock(id, stock_quantite),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
            queryClient.invalidateQueries({ queryKey: ['my-store'] });
            toast.success("Stock mis à jour avec succès.");
        },
        onError: () => {
            toast.error("Impossible de modifier le stock.");
        }
    });
};

/**
 * useDeleteProduct — Mutation pour supprimer un produit.
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => productService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
            queryClient.invalidateQueries({ queryKey: ['my-store'] });
            toast.success("Article supprimé de l'inventaire.");
        },
        onError: () => {
            toast.error("Impossible de supprimer l'article.");
        }
    });
};

/**
 * useCategories — Lister toutes les catégories de produits.
 */
export const useCategories = () => {
    const { data, isLoading: loading, error, isFetching } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAll(),
        staleTime: 60 * 60_000, // Les catégories changent rarement
    });
    return { data, loading, error: error?.message || null, isFetching };
};
