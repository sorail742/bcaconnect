import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import creditService from '../../services/creditService';
import { toast } from 'sonner';

/**
 * useMyCredits — Crédits et échéanciers de l'utilisateur.
 */
export const useMyCredits = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['my-credits'],
        queryFn: () => creditService.getMyCredits(),
        staleTime: 60_000,
    });
    return { data: Array.isArray(data) ? data : [], loading, error: error?.message || null, refetch, isFetching };
};

/**
 * usePayInstallment — Payer une échéance de crédit.
 */
export const usePayInstallment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (echeanceId) => creditService.payInstallment(echeanceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-credits'] });
            toast.success('Échéance payée avec succès !');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Erreur lors du paiement.');
        },
    });
};

/**
 * useCreditSimulation — Simule un crédit en temps réel.
 */
export const useCreditSimulation = (params) => {
    const payload = params?.montant
        ? { montant: params.montant, duree_mois: params.mois || params.duree_mois, taux: params.taux }
        : null;
    return useQuery({
        queryKey: ['credit-simulation', payload],
        queryFn: () => creditService.simulate(payload),
        enabled: !!(payload?.montant && payload?.duree_mois),
        staleTime: 5 * 60_000,
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
