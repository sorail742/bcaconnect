import { useQuery } from '@tanstack/react-query';
import productService from '../../services/productService';
import useAuthStore from '../../store/authStore';

/**
 * useProducts — Lister les produits avec filtres serveur.
 * Cache 2min, déduplication automatique.
 */
export const useProducts = (params = {}) => {
    const paramsKey = JSON.stringify(params);
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['products', paramsKey],
        queryFn: () => productService.getAll(params),
        staleTime: 2 * 60_000,
    });
    return { data, loading, error: error?.message || null, isFetching, refetch, mutate: refetch };
};

/**
 * useProductById — Détail d'un produit.
 * Cache 2 min, activé uniquement si un ID est présent.
 */
export const useProductById = (id) => {
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id),
        staleTime: 5 * 60_000, // Les détails produits changent peu
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
