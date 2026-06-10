import { useQuery } from '@tanstack/react-query';
import deliveryService from '../../services/deliveryService';
import useAuthStore from '../../store/authStore';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const useTrackOrder = (trackingNumber, enabled = true) => {
    const { token, isAuthenticated } = useAuthStore();
    const trimmed = trackingNumber?.trim() || '';
    const isFullUuid = UUID_RE.test(trimmed);

    return useQuery({
        queryKey: ['track-order', trimmed, isAuthenticated && isFullUuid],
        queryFn: () => (isAuthenticated && isFullUuid && token)
            ? deliveryService.trackOrderForUser(trimmed)
            : deliveryService.trackOrder(trimmed),
        enabled: !!trimmed && enabled,
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
