import { useQuery } from '@tanstack/react-query';
import priceIndexService from '../services/priceIndexService';

export const usePriceIndexByCategory = (categorieId, months = 6) => {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ['price-index-category', categorieId, months],
        queryFn: () => priceIndexService.getByCategory(categorieId, months),
        enabled: !!categorieId,
        staleTime: 10 * 60_000,
    });
    return { data, loading, error };
};

export const usePriceIndexByProduct = (produitId, months = 6) => {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ['price-index-product', produitId, months],
        queryFn: () => priceIndexService.getByProduct(produitId, months),
        enabled: !!produitId,
        staleTime: 10 * 60_000,
    });
    return { data, loading, error };
};
