import api from './api';
import { offlineStorage } from '../lib/db';

const productService = {
    getAll: async () => {
        if (!navigator.onLine) {
            console.log("📦 Récupération des produits depuis le cache local...");
            return await offlineStorage.getProducts();
        }
        try {
            const response = await api.get('/products');
            const data = response.data;
            
            // L'API renvoie { total, pages, products: [] } ou directement []
            const products = Array.isArray(data) ? data : (data.products || []);
            
            // Mise à jour silencieuse du cache (bulkPut attend un tableau)
            if (products.length > 0) {
                offlineStorage.saveProducts(products).catch(err => console.error("Erreur cache products:", err));
            }
            return products;
        } catch (error) {
            console.error("Erreur réseau products, tentative cache...");
            return await offlineStorage.getProducts();
        }
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
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
