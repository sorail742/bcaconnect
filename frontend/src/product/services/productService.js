import api from '../../services/api';
import { offlineStorage } from '../../lib/db';
import categoryService from '../../category/services/categoryService';

const productService = {
    getCategories: () => categoryService.getAll(),

    getAll: async (params = {}) => {
        if (!navigator.onLine && Object.keys(params).length === 0) {
            return await offlineStorage.getProducts();
        }
        try {
        // Nettoyer les paramètres : si categorie_id n'est pas un UUID valide, on le supprime pour éviter l'erreur serveur
        if (params.categorie_id && !/^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/.test(params.categorie_id)) {
            delete params.categorie_id;
        }
        const response = await api.get('/products', { params, timeout: 15000, _bg: true });
            const data = response.data;
            
            // On cache les produits si on récupère la liste complète sans filtres complexes
            if (Object.keys(params).length === 0 && Array.isArray(data)) {
                offlineStorage.saveProducts(data).catch(err => console.error("Erreur cache produits:", err));
            }

            // Standardize return format so components expecting { products: [] } don't break when it's an array
            if (Array.isArray(data)) {
                return { products: data, total: data.length, pages: 1 };
            }
            return data;
        } catch (error) {
            if (Object.keys(params).length === 0) {
                const cached = await offlineStorage.getProducts();
                if (cached?.length) return { products: cached, total: cached.length, pages: 1 };
            }
            if (!error.response) {
                return { products: [], total: 0, pages: 0 };
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

    delete: async (id, confirmationText) => {
        const response = await api.delete(`/products/${id}`, { data: { confirmation_nom: confirmationText } });
        return response.data;
    },

    // 🔍 Recherche globale
    searchProducts: async (query) => {
        return await productService.getAll({ search: query });
    },

    // ✨ Produits à la une (Landing Page)
    getFeatured: async (limit = 8) => {
        const response = await productService.getAll({ featured: true, limit });
        // Make sure it consistently returns an array or an object with products
        return response;
    }
};

export default productService;
