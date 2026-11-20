import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import technicianService from '../services/technicianService';
import { toast } from 'sonner';
import { getSpecialtyLabel } from '../../constants/technicianSpecialties';

// Référence stable — voir useUserData.js pour le détail du bug évité.
const EMPTY_ARRAY = [];

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
    photos_urls: m.photos_urls || [],
    specialite: m.specialite_requise ? getSpecialtyLabel(m.specialite_requise) : null,
});

export const useTechnicianStats = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['technician-stats'],
        queryFn: () => technicianService.getStats(),
        staleTime: 30_000,
    });
    return { data: data || null, loading, error: error?.message || null, refetch, isFetching };
};

export const useAllTechnicianMissions = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['technician-missions-all'],
        queryFn: async () => {
            const [available, mine] = await Promise.all([
                technicianService.getAvailableMissions(),
                technicianService.getMyMissions(),
            ]);
            const formattedAvailable = (available || []).map((m) => formatMission(m, 'Nouveau'));
            const formattedMine = (mine || []).map((m) => formatMission(m));
            return [...formattedAvailable, ...formattedMine];
        },
        staleTime: 30_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch, isFetching };
};

export const useMyTechnicianMissions = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['technician-missions-my'],
        queryFn: async () => {
            const rows = await technicianService.getMyMissions();
            return (rows || []).map((m) => formatMission(m));
        },
        staleTime: 30_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch, isFetching };
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
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch, isFetching };
};

export const useTechnicianEquipments = () => {
    const { data, isLoading: loading, error, refetch, isFetching } = useQuery({
        queryKey: ['technician-equipments'],
        queryFn: () => technicianService.getEquipments(),
        staleTime: 60_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch, isFetching };
};

export const useAcceptTechnicianMission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => technicianService.acceptMission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['technician-missions-my'] });
            queryClient.invalidateQueries({ queryKey: ['technician-missions-available'] });
            queryClient.invalidateQueries({ queryKey: ['technician-missions-all'] });
            queryClient.invalidateQueries({ queryKey: ['technician-stats'] });
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
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['technician-missions-my'] });
            queryClient.invalidateQueries({ queryKey: ['technician-missions-all'] });
            queryClient.invalidateQueries({ queryKey: ['technician-stats'] });
            queryClient.invalidateQueries({ queryKey: ['technician-equipments'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            const fee = result?.feeCredited;
            if (fee > 0) {
                toast.success(`Mission terminée — ${fee.toLocaleString('fr-FR')} GNF crédités.`);
            } else {
                toast.success('Mission marquée comme complétée.');
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Erreur lors de la finalisation.');
        },
    });
};
