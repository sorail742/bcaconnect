import React, { useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { toast } from 'sonner';

/**
 * SocketHandler Component
 * Centralizes global socket listeners for notifications and real-time updates.
 */
const SocketHandler = () => {
    const { on } = useSocket();

    useEffect(() => {
        if (!on) return;

        // Global notification listener
        on('notification_received', (notif) => {
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
        });

        // Inbox messenger listener
        on('new_message', (data) => {
            toast.info("Nouveau message", {
                description: `Vous avez reçu un message de ${data.message?.expediteur?.nom_complet || 'un utilisateur'}.`,
            });
        });

        // Product update listener
        on('product_added', (newProduct) => {
            toast.info(`🎉 Nouveau produit : ${newProduct.nom_produit}`, {
                duration: 4000
            });
        });

    }, [on]);

    return null; // This component doesn't render anything visually
};

export default SocketHandler;
