import { useQuery } from '@tanstack/react-query';
import deliveryService from '../../services/deliveryService';

export const useTrackOrder = (trackingNumber, enabled = true) => {
    return useQuery({
        queryKey: ['track-order', trackingNumber],
        queryFn: () => deliveryService.trackOrder(trackingNumber),
        enabled: !!trackingNumber?.trim() && enabled,
        staleTime: 15_000,
        refetchInterval: (query) => {
            const status = query.state.data?.statut_livraison;
            if (['en_route', 'en_cours', 'ramasse'].includes(status)) {
                return 15_000;
            }
            return false;
        },
    });
};
