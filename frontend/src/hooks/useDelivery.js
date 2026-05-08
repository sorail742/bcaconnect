import { useState, useCallback, useEffect } from 'react';
import deliveryService from '../services/deliveryService';
import { toast } from 'sonner';

/**
 * Hook pour gérer la logique de livraison et de suivi.
 * @param {string} orderId - ID de la commande à suivre (optionnel)
 */
export const useDelivery = (orderId = null) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async (id) => {
        const targetId = id || orderId;
        if (!targetId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await deliveryService.getHistory(targetId);
            setHistory(data);
            return data;
        } catch (err) {
            const message = err.response?.data?.message || "Erreur lors de la récupération de l'historique.";
            setError(message);
            // On ne toast pas ici pour éviter de polluer l'UI si l'ID est invalide lors de la saisie
            throw err;
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const confirmDelivery = async (id, otp) => {
        setLoading(true);
        try {
            const response = await deliveryService.verifyDelivery(id, otp);
            toast.success("Livraison confirmée avec succès !");
            await fetchHistory(id); // Rafraîchir l'historique
            return response;
        } catch (err) {
            const message = err.response?.data?.message || "Code OTP incorrect ou erreur serveur.";
            toast.error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Charger l'historique au montage si orderId est fourni
    useEffect(() => {
        if (orderId) {
            fetchHistory(orderId).catch(() => {});
        }
    }, [orderId, fetchHistory]);

    return {
        history,
        loading,
        error,
        fetchHistory,
        confirmDelivery
    };
};

export default useDelivery;
