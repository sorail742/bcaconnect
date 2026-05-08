import api from './api';
import { offlineStorage } from '../lib/db';

const categoryService = {
    getAll: async () => {
        if (!navigator.onLine) {
            return await offlineStorage.getCategories();
        }
        try {
            const response = await api.get('/categories');
            const categories = response.data;
            offlineStorage.saveCategories(categories).catch(err => console.error("Erreur cache categories:", err));
            return categories;
        } catch (error) {
            return await offlineStorage.getCategories();
        }
    },

    create: async (categoryData) => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    update: async (id, categoryData) => {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};

export default categoryService;
