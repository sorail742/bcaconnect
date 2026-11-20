import api from '../../services/api';

const shippingService = {
    getOptions: async (adresse, itemsCount = 1) => {
        const response = await api.get('/orders/shipping-quote', {
            params: { adresse, items: itemsCount },
        });
        return response.data?.options || [];
    },

    getQuote: async (adresse, itemsCount, type) => {
        const response = await api.get('/orders/shipping-quote', {
            params: { adresse, items: itemsCount, type },
        });
        return response.data;
    },
};

export const DELIVERY_TYPE_LABELS = {
    eco: 'Économique',
    standard: 'Standard',
    prioritaire: 'Prioritaire',
};

export default shippingService;
