import { offlineStorage } from '../lib/db';
import api from './api';
import productService from './productService';
import categoryService from './categoryService';
import { toast } from 'sonner';

class SyncService {
    constructor() {
        this.isSyncing = false;
        this.syncInterval = null;
        this.listeners = new Set();
    }

    subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    notify() {
        this.listeners.forEach((fn) => fn());
    }

    async getPendingCount() {
        const [orders, products] = await Promise.all([
            offlineStorage.getQueuedOrders(),
            offlineStorage.getQueuedProducts(),
        ]);
        return orders.length + products.length;
    }

    init() {
        window.addEventListener('online', () => {
            toast.info('Connexion rétablie. Synchronisation en cours...');
            this.syncAll();
        });

        window.addEventListener('offline', () => {
            toast.warning('Mode hors ligne — vos actions seront synchronisées au retour du réseau.');
            this.notify();
        });

        if (navigator.onLine) {
            this.syncAll();
        }

        this.syncInterval = setInterval(() => {
            if (navigator.onLine && !this.isSyncing) {
                this.syncAll();
            }
        }, 5 * 60 * 1000);
    }

    async syncAll() {
        if (this.isSyncing || !navigator.onLine) return;
        this.isSyncing = true;

        try {
            await this.syncOrders();
            await this.syncProducts();
            this.refreshCache();
        } catch (error) {
            console.error('Erreur de synchronisation:', error);
        } finally {
            this.isSyncing = false;
            this.notify();
        }
    }

    async syncOrders() {
        const queuedOrders = await offlineStorage.getQueuedOrders();
        if (queuedOrders.length === 0) return;

        for (const order of queuedOrders) {
            try {
                const { id, status, timestamp, ...apiData } = order;
                await api.post('/orders', apiData);
                await offlineStorage.markOrderSynced(id);
                toast.success('Commande hors ligne synchronisée !');
            } catch (error) {
                console.error(`Erreur synchro commande ${order.id}:`, error);
                await offlineStorage.markOrderFailed(order.id, error?.response?.data?.message || error.message);
            }
        }
    }

    async syncProducts() {
        const queuedProducts = await offlineStorage.getQueuedProducts();
        if (queuedProducts.length === 0) return;

        for (const product of queuedProducts) {
            try {
                const { id, status, timestamp, ...apiData } = product;
                await api.post('/products', apiData);
                await offlineStorage.markProductSynced(id);
                toast.success(`Produit "${apiData.nom_produit}" synchronisé !`);
            } catch (error) {
                console.error(`Erreur synchro produit ${product.id}:`, error);
                await offlineStorage.markProductFailed(product.id, error?.response?.data?.message || error.message);
            }
        }
    }

    async refreshCache() {
        try {
            const productsRes = await productService.getAll();
            const list = productsRes?.products || productsRes || [];
            if (Array.isArray(list) && list.length) {
                await offlineStorage.saveProducts(list);
            }
            await categoryService.getAll();
        } catch (error) {
            console.warn('Échec du rafraîchissement du cache:', error);
        }
    }

    destroy() {
        if (this.syncInterval) clearInterval(this.syncInterval);
    }
}

export const syncService = new SyncService();
