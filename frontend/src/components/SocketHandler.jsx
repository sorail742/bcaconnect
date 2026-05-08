import React, { useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { toast } from 'sonner';

/**
 * SocketHandler Component
 * Centralizes global socket listeners for notifications and real-time updates.
 */
const SocketHandler = () => {
    const { on, off } = useSocket();

    useEffect(() => {
        if (!on || !off) return;

        const handleNotification = (notif) => {
            toast.success(notif.titre || "Nouvelle notification", {
                description: notif.message?.replace(/<[^>]*>?/gm, '') || '',
                duration: 5000,
                action: {
                    label: 'Voir',
                    onClick: () => {
                        if (notif.type === 'order') window.location.href = '/orders';
                    }
                }
            });
        };

        const handleNewMessage = (data) => {
            toast.info("Nouveau message", {
                description: `Vous avez reçu un message de ${data.message?.expediteur?.nom_complet || 'un utilisateur'}.`,
            });
        };

        const handleProductAdded = (newProduct) => {
            toast.info(`🎉 Nouveau produit : ${newProduct.nom_produit}`, {
                duration: 4000
            });
        };

        on('notification_received', handleNotification);
        on('new_message', handleNewMessage);
        on('product_added', handleProductAdded);

        return () => {
            off('notification_received', handleNotification);
            off('new_message', handleNewMessage);
            off('product_added', handleProductAdded);
        };

    }, [on, off]);

    return null; // This component doesn't render anything visually
};

export default SocketHandler;
