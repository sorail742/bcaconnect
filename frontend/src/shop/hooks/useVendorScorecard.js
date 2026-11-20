import { useQuery } from '@tanstack/react-query';
import vendorScorecardService from '../services/vendorScorecardService';

export const useVendorScorecard = (vendorId) => {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ['vendor-scorecard', vendorId],
        queryFn: () => vendorScorecardService.getScorecard(vendorId),
        enabled: !!vendorId,
        staleTime: 10 * 60_000,
        retry: false, // 404 attendu pour un utilisateur qui n'est pas fournisseur
    });
    return { data, loading, error };
};
