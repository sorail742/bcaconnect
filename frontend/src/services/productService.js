import api from './api';
import { offlineStorage } from '../lib/db';

const productService = {
    getAll: async (params = {}) => {
        if (!navigator.onLine && Object.keys(params).length === 0) {
            return await offlineStorage.getProducts();
        }
        try {
            const response = await api.get('/products', { params });
            const data = response.data;
            
            // On retourne soit le tableau de produits, soit l'objet paginé complet
            return data;
        } catch (error) {
            if (Object.keys(params).length === 0) {
                return await offlineStorage.getProducts();
            }
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                (error.response?.status === 404 ? 'Produit introuvable.' : 'Erreur lors du chargement du produit.')
            );
        }
    },

    // Produits de MON magasin (vendeur connecté)
    getMyProducts: async () => {
        const response = await api.get('/products/me/products');
        return response.data;
    },

    create: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    update: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    // Mise à jour du stock uniquement (endpoint léger)
    patchStock: async (id, stock_quantite) => {
        const response = await api.patch(`/products/${id}/stock`, { stock_quantite });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    }
};

export default productService;
