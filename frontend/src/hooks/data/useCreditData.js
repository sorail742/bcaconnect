import { useQuery, useMutation } from '@tanstack/react-query';
import creditService from '../../services/creditService';
import { toast } from 'sonner';

/**
 * useCreditSimulation — Simule un crédit en temps réel.
 */
export const useCreditSimulation = (params) => {
    return useQuery({
        queryKey: ['credit-simulation', params],
        queryFn: () => creditService.simulate(params),
        enabled: !!params?.montant && !!params?.duree_mois,
        staleTime: 5 * 60_000, // Les paramètres de simulation ne changent pas souvent
    });
};

/**
 * useCreditScore — Récupère le score IA de l'utilisateur.
 */
export const useCreditScore = () => {
    return useQuery({
        queryKey: ['credit-score'],
        queryFn: () => creditService.getScore(),
        staleTime: 10 * 60_000,
    });
};

/**
 * useRequestCredit — Soumet une demande de crédit.
 */
export const useRequestCredit = () => {
    return useMutation({
        mutationFn: (data) => creditService.request(data),
        onSuccess: () => {
            toast.success("Demande de crédit soumise avec succès !");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Erreur lors de la soumission.");
        }
    });
};
