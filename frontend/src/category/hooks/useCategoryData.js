import { useQuery } from '@tanstack/react-query';
import categoryService from '../services/categoryService';

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
