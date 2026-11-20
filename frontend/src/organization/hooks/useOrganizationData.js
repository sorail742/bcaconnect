import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import organizationService from '../services/organizationService';

export const useMyOrganizations = () => {
    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['my-organizations'],
        queryFn: organizationService.getMine,
        staleTime: 60_000,
    });
    return { data, loading, refetch };
};

export const useCreateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: organizationService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-organizations'] });
            toast.success('Organisation créée.');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Impossible de créer l\'organisation.'),
    });
};

export const useOrganizationMembers = (orgId) => {
    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['organization-members', orgId],
        queryFn: () => organizationService.listMembers(orgId),
        enabled: !!orgId,
    });
    return { data, loading, refetch };
};

export const useInviteMember = (orgId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ email, role_membre }) => organizationService.inviteMember(orgId, email, role_membre),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization-members', orgId] });
            toast.success('Membre ajouté.');
        },
        onError: (e) => toast.error(e.response?.data?.message || "Impossible d'ajouter ce membre."),
    });
};

export const useRemoveMember = (orgId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (memberId) => organizationService.removeMember(orgId, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization-members', orgId] });
            toast.success('Membre retiré.');
        },
    });
};

export const useUpdateThreshold = (orgId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (plafond) => organizationService.updateThreshold(orgId, plafond),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-organizations'] });
            toast.success('Plafond mis à jour.');
        },
    });
};

export const usePendingOrderRequests = (orgId) => {
    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['org-pending-requests', orgId],
        queryFn: () => organizationService.listPendingRequests(orgId),
        enabled: !!orgId,
        refetchInterval: 30_000,
    });
    return { data, loading, refetch };
};

export const useApproveRequest = (orgId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: organizationService.approveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-pending-requests', orgId] });
            toast.success('Commande approuvée et créée.');
        },
        onError: (e) => toast.error(e.response?.data?.message || "Impossible d'approuver cette demande."),
    });
};

export const useRejectRequest = (orgId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ requestId, commentaire }) => organizationService.rejectRequest(requestId, commentaire),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-pending-requests', orgId] });
            toast.success('Demande refusée.');
        },
    });
};
