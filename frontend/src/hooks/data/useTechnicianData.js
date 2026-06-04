import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import technicianService from '../../services/technicianService';
import { toast } from 'sonner';

const formatMission = (m, defaultStatus) => ({
    id: m.id,
    raw: m,
    title: `Intervention sur ${m.Product?.nom_produit || 'Équipement'}`,
    client: m.demandeur?.nom_complet || 'Client Inconnu',
    phone: m.demandeur?.telephone || 'Non spécifié',
    location: m.demandeur?.adresse || 'Non spécifiée',
    status: defaultStatus || (m.status === 'en_cours' ? 'En cours' : m.status === 'resolu' ? 'Complété' : m.status || 'Nouveau'),
    date: new Date(m.createdAt).toLocaleDateString('fr-FR'),
    type: 'Maintenance',
    description: m.description_probleme || 'Aucune description fournie.',
});

export const useMyTechnicianMissions = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['technician-missions-my'],
        queryFn: async () => {
            const rows = await technicianService.getMyMissions();
            return (rows || []).map((m) => formatMission(m));
        },
        staleTime: 30_000,
    });
    return { data: data || [], loading, error: error?.message || null, refetch, isFetching };
};

export const useAvailableTechnicianMissions = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['technician-missions-available'],
        queryFn: async () => {
            const rows = await technicianService.getAvailableMissions();
            return (rows || []).map((m) => formatMission(m, 'Nouveau'));
        },
        staleTime: 30_000,
    });
    return { data: data || [], loading, error: error?.message || null, refetch, isFetching };
};

export const useTechnicianEquipments = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['technician-equipments'],
        queryFn: () => technicianService.getEquipments(),
        staleTime: 60_000,
    });
    return { data: data || [], loading, error: error?.message || null, refetch, isFetching };
};

export const useAcceptTechnicianMission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => technicianService.acceptMission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['technician-missions-my'] });
            queryClient.invalidateQueries({ queryKey: ['technician-missions-available'] });
            toast.success('Mission acceptée avec succès.');
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || "Erreur lors de l'acceptation.");
        },
    });
};

export const useCompleteTechnicianMission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => technicianService.completeMission(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['technician-missions-my'] });
            toast.success('Mission marquée comme complétée.');
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Erreur lors de la finalisation.');
        },
    });
};
