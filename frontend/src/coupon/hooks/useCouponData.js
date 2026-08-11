import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import couponService from '../services/couponService';
import { toast } from 'sonner';

const EMPTY_ARRAY = [];

export const useMyCoupons = () => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['coupons-mine'],
        queryFn: () => couponService.getMine(),
        staleTime: 20_000,
    });
    return { data: data || EMPTY_ARRAY, loading, error: error?.message || null, refetch };
};

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => couponService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons-mine'] });
            toast.success('Code promo créé.');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Impossible de créer le code promo.'),
    });
};

export const useToggleCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => couponService.toggleActive(id),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['coupons-mine'] });
            toast.success(res?.message);
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Action impossible.'),
    });
};
