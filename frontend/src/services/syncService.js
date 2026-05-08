import { offlineStorage } from '../lib/db';
import orderService from './orderService';
import productService from './productService';
import categoryService from './categoryService';
import { toast } from 'sonner';

class SyncService {
    constructor() {
        this.isSyncing = false;
        this.syncInterval = null;
    }

    init() {
        // Surveiller le retour au mode en ligne
        window.addEventListener('online', () => {
            toast.info("Connexion rétablie. Synchronisation des données...");
            this.syncAll();
        });

        // Surveiller le passage hors ligne
        window.addEventListener('offline', () => {
            toast.warning("Vous êtes maintenant hors ligne. Mode résilience activé.");
        });

        // Lancer une synchro initiale si on est en ligne
        if (navigator.onLine) {
            this.syncAll();
        }

        // Configurer une synchro périodique toutes les 5 minutes si en ligne
        this.syncInterval = setInterval(() => {
            if (navigator.onLine && !this.isSyncing) {
                this.syncAll();
            }
        }, 5 * 60 * 1000);
    }

    async syncAll() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            console.log("🔄 Début de la synchronisation globale...");
            
            // 1. Synchroniser les commandes en attente
            await this.syncOrders();
            
            // 2. Mettre à jour le cache (en arrière-plan, ne bloque pas l'utilisateur)
            this.refreshCache();

            console.log("✅ Synchronisation terminée.");
        } catch (error) {
            console.error("❌ Erreur de synchronisation:", error);
        } finally {
            this.isSyncing = false;
        }
    }

    async syncOrders() {
        const queuedOrders = await offlineStorage.getQueuedOrders();
        if (queuedOrders.length === 0) return;

        console.log(`📦 Synchro de ${queuedOrders.length} commandes en attente...`);
        
        for (const order of queuedOrders) {
            try {
                // On retire les champs internes de Dexie avant l'envoi
                const { id, status, timestamp, ...apiData } = order;
                await orderService.create(apiData);
                await offlineStorage.markOrderSynced(id);
                toast.success(`Commande #${id} synchronisée !`);
            } catch (error) {
                console.error(`Erreur synchro commande ${order.id}:`, error);
                await offlineStorage.markOrderFailed(order.id, error.message);
            }
        }
    }

    async refreshCache() {
        try {
            // Force le rafraîchissement des produits et catégories pour le cache local
            await productService.getAll();
            await categoryService.getAll();
        } catch (error) {
            console.warn("Échec du rafraîchissement du cache:", error);
        }
    }

    destroy() {
        if (this.syncInterval) clearInterval(this.syncInterval);
    }
}

export const syncService = new SyncService();
