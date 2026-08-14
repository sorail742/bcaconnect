import api from '../../services/api';

const invoiceService = {
    createFromOrder: async (orderId, acheteur_nif) => (await api.post(`/invoices/from-order/${orderId}`, { acheteur_nif: acheteur_nif || undefined })).data,
    getById: async (id) => (await api.get(`/invoices/${id}`)).data,
    getMine: async () => (await api.get('/invoices/mine')).data,
    getVendorMine: async () => (await api.get('/invoices/vendor-mine')).data,
};

export default invoiceService;
