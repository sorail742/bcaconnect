import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import invoiceService from '../services/invoiceService';

export const useMyInvoices = () => {
    const { data, isLoading: loading } = useQuery({
        queryKey: ['invoices-mine'],
        queryFn: invoiceService.getMine,
        staleTime: 30_000,
    });
    return { data: data || [], loading };
};

export const useVendorInvoices = () => {
    const { data, isLoading: loading } = useQuery({
        queryKey: ['invoices-vendor-mine'],
        queryFn: invoiceService.getVendorMine,
        staleTime: 30_000,
    });
    return { data: data || [], loading };
};

export const useCreateInvoiceFromOrder = () => {
    return useMutation({
        mutationFn: ({ orderId, acheteurNif }) => invoiceService.createFromOrder(orderId, acheteurNif),
        onError: (e) => toast.error(e.response?.data?.message || "Impossible de générer la facture."),
    });
};

export const useInvoiceDetail = () => {
    return useMutation({
        mutationFn: (id) => invoiceService.getById(id),
        onError: () => toast.error("Impossible de charger la facture."),
    });
};
