import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { getDashboardRoute, getOrdersRoute } from '../constants/roles';
import { toast } from 'sonner';

/**
 * SocketHandler — notifications et mises à jour temps réel (redirections par rôle)
 */
const SocketHandler = () => {
    const { on, off } = useSocket();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!on || !off) return;

        const handleNotification = (notif) => {
            const actionPath = notif.type === 'order' && user?.role
                ? getOrdersRoute(user.role)
                : '/notifications';

            toast.success(notif.titre || 'Nouvelle notification', {
                description: notif.message?.replace(/<[^>]*>?/gm, '') || '',
                duration: 5000,
                action: {
                    label: 'Voir',
                    onClick: () => navigate(actionPath),
                },
            });
        };

        const handleNewMessage = () => {
            toast.info('Nouveau message', {
                description: 'Vous avez reçu un nouveau message.',
                action: {
                    label: 'Ouvrir',
                    onClick: () => navigate('/messages'),
                },
            });
        };

        const handleProductAdded = (newProduct) => {
            toast.info(`Nouveau produit : ${newProduct.nom_produit}`, { duration: 4000 });
        };

        on('notification_received', handleNotification);
        on('new_message', handleNewMessage);
        on('product_added', handleProductAdded);

        return () => {
            off('notification_received', handleNotification);
            off('new_message', handleNewMessage);
            off('product_added', handleProductAdded);
        };
    }, [on, off, navigate, user?.role]);

    return null;
};

export default SocketHandler;
