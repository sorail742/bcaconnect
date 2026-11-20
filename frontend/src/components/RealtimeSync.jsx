import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useSocket from '../hooks/useSocket';
import useAuthStore from '../store/authStore';

/**
 * Invalide les caches React Query à chaque événement socket métier
 * (commandes, livraisons, suivi) — pas besoin de rafraîchir manuellement.
 */
const RealtimeSync = () => {
    const queryClient = useQueryClient();
    const { on, off } = useSocket();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (!on || !isAuthenticated) return;

        const invalidateLogistics = () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order'] });
            queryClient.invalidateQueries({ queryKey: ['available-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['completed-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['my-groups'] });
            queryClient.invalidateQueries({ queryKey: ['carrier-stats'] });
            queryClient.invalidateQueries({ queryKey: ['order-stats'] });
            queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
        };

        const handleOrderUpdate = () => invalidateLogistics();

        const handleTracking = (payload) => {
            if (payload?.orderId) {
                queryClient.invalidateQueries({ queryKey: ['journey-history', payload.orderId] });
                queryClient.invalidateQueries({ queryKey: ['track-order', payload.orderId] });
            }
            invalidateLogistics();
        };

        const handleNotification = (notif) => {
            if (['order', 'delivery'].includes(notif?.type)) {
                invalidateLogistics();
            }
        };

        on('order_status_updated', handleOrderUpdate);
        on('delivery_available', handleOrderUpdate);
        on('delivery_tracking_update', handleTracking);
        on('notification_received', handleNotification);

        return () => {
            off('order_status_updated', handleOrderUpdate);
            off('delivery_available', handleOrderUpdate);
            off('delivery_tracking_update', handleTracking);
            off('notification_received', handleNotification);
        };
    }, [on, off, queryClient, isAuthenticated]);

    return null;
};

export default RealtimeSync;
