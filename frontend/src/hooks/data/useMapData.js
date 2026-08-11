import { useQuery } from '@tanstack/react-query';
import userService from '../../user/services/userService';
import orderService from '../../order/services/orderService';
import storeService from '../../shop/services/storeService';
import technicianService from '../../technician/services/technicianService';
import creditService from '../../credit/services/creditService';

// Référence stable — voir useUserData.js pour le détail du bug évité (useEffect en boucle).
const EMPTY_ARRAY = [];

export const useUserLocations = (role = '') => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['user-locations', role],
        queryFn: () => userService.getLocations(role),
        staleTime: 30_000,
        refetchInterval: 30_000,
    });
    return { data: data || EMPTY_ARRAY, isLoading, error: error?.message || null, refetch, isFetching };
};

export const useMyClientsMap = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['my-clients-map'],
        queryFn: () => storeService.getMyClientsMap(),
        staleTime: 60_000,
    });
    return { data: data || EMPTY_ARRAY, isLoading, error: error?.message || null, refetch, isFetching };
};

export const useMyVendorsMap = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['my-vendors-map'],
        queryFn: () => orderService.getMyVendorsMap(),
        staleTime: 60_000,
    });
    return { data: data || EMPTY_ARRAY, isLoading, error: error?.message || null, refetch, isFetching };
};

export const useMyMissionsMap = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['my-missions-map'],
        queryFn: () => technicianService.getMyMissionsMap(),
        staleTime: 30_000,
    });
    return { data: data || EMPTY_ARRAY, isLoading, error: error?.message || null, refetch, isFetching };
};

export const useCreditApplicantsMap = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['credit-applicants-map'],
        queryFn: () => creditService.getApplicantsMap(),
        staleTime: 60_000,
    });
    return { data: data || EMPTY_ARRAY, isLoading, error: error?.message || null, refetch, isFetching };
};
