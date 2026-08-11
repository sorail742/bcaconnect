import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { getDashboardRoute, getOrdersRoute } from '../constants/roles';
import { toast } from 'sonner';

import { useQueryClient } from '@tanstack/react-query';

/**
 * SocketHandler — notifications et mises à jour temps réel (redirections par rôle)
 */
const SocketHandler = () => {
    const { on, off } = useSocket();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

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

        const handleNewPost = (post) => {
            toast.info(post.message || 'Nouvelle publication !', { duration: 5000 });
            if (post.type === 'education') {
                queryClient.invalidateQueries({ queryKey: ['education-resources'] });
            } else if (post.type === 'product') {
                queryClient.invalidateQueries({ queryKey: ['products'] });
            }
        };

        const handleNewCreditRequest = () => {
            toast.info('Nouvelle demande de crédit reçue !', { duration: 5000 });
            queryClient.invalidateQueries({ queryKey: ['pending-credits'] });
            queryClient.invalidateQueries({ queryKey: ['admin-credits'] });
        };

        const handleCreditRepayment = () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-history'] });
            queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
            queryClient.invalidateQueries({ queryKey: ['my-credits'] });
            queryClient.invalidateQueries({ queryKey: ['admin-credits'] });
        };

        const handleWebinarLive = (webinar) => {
            toast.info(`🔴 Webinaire en direct : ${webinar?.titre || 'Nouveau webinaire'}`, {
                description: `Intervenant : ${webinar?.intervenant || ''}`,
                duration: 8000,
                action: {
                    label: 'Rejoindre',
                    onClick: () => navigate('/education'),
                },
            });
            queryClient.invalidateQueries({ queryKey: ['webinars'] });
        };

        const handleSavAssigned = (data) => {
            toast.success('🔧 Technicien assigné à votre intervention !', {
                description: `Un technicien prend en charge votre demande.`,
                duration: 6000,
                action: {
                    label: 'Voir',
                    onClick: () => navigate('/sav/interventions'),
                },
            });
            queryClient.invalidateQueries({ queryKey: ['my-interventions'] });
        };

        const handleWalletUpdated = (data) => {
            if (data?.amount > 0) {
                toast.success(`💰 +${parseFloat(data.amount).toLocaleString('fr-GN')} GNF crédités`, {
                    description: 'Votre portefeuille a été mis à jour.',
                    duration: 5000,
                    action: {
                        label: 'Voir',
                        onClick: () => navigate('/wallet'),
                    },
                });
            }
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
        };

        on('notification_received', handleNotification);
        on('new_message', handleNewMessage);
        on('product_added', handleProductAdded);
        on('new_post', handleNewPost);
        on('new_credit_request', handleNewCreditRequest);
        on('credit_repayment_received', handleCreditRepayment);
        on('webinar_go_live', handleWebinarLive);
        on('sav_mission_accepted', handleSavAssigned);
        on('wallet_updated', handleWalletUpdated);

        return () => {
            off('notification_received', handleNotification);
            off('new_message', handleNewMessage);
            off('product_added', handleProductAdded);
            off('new_post', handleNewPost);
            off('new_credit_request', handleNewCreditRequest);
            off('credit_repayment_received', handleCreditRepayment);
            off('webinar_go_live', handleWebinarLive);
            off('sav_mission_accepted', handleSavAssigned);
            off('wallet_updated', handleWalletUpdated);
        };
    }, [on, off, navigate, user?.role, queryClient]);

    return null;
};

export default SocketHandler;
