import api from '../../services/api';
import { offlineStorage } from '../../lib/db';
import categoryService from '../../category/services/categoryService';

// La pagination/le tri ne changent pas le "catalogue de base" mis en cache —
// seuls les filtres réels (recherche, catégorie, prix, état, vérifié) rendent
// un résultat non représentatif du catalogue complet et doivent désactiver le
// cache. Sans cette distinction, la page Catalogue (qui envoie toujours au
// moins { page, limit, sort }) ne déclenchait jamais le cache/fallback
// offline en pratique — voir cahier des charges 1.12.
const PAGINATION_ONLY_KEYS = new Set(['page', 'limit', 'sort']);
const hasRealFilters = (params) => Object.keys(params).some((key) => !PAGINATION_ONLY_KEYS.has(key));

const productService = {
    getCategories: () => categoryService.getAll(),

    getAll: async (params = {}) => {
        if (!navigator.onLine && !hasRealFilters(params)) {
            const cached = await offlineStorage.getProducts();
            return { products: cached, total: cached.length, pages: 1 };
        }
        try {
        // Nettoyer les paramètres : si categorie_id n'est pas un UUID valide, on le supprime pour éviter l'erreur serveur
        if (params.categorie_id && !/^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/.test(params.categorie_id)) {
            delete params.categorie_id;
        }
        const response = await api.get('/products', { params, timeout: 15000, _bg: true });
            const data = response.data;

            // On cache les produits si on récupère la liste complète sans filtres réels
            if (!hasRealFilters(params) && Array.isArray(data)) {
                offlineStorage.saveProducts(data).catch(err => console.error("Erreur cache produits:", err));
            }

            // Standardize return format so components expecting { products: [] } don't break when it's an array
            if (Array.isArray(data)) {
                return { products: data, total: data.length, pages: 1 };
            }
            return data;
        } catch (error) {
            if (!hasRealFilters(params)) {
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

    // Configuration du réapprovisionnement automatique
    patchReappro: async (id, { reappro_auto_actif, reappro_seuil, reappro_quantite }) => {
        const response = await api.patch(`/products/${id}/reappro`, { reappro_auto_actif, reappro_seuil, reappro_quantite });
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
