import { offlineStorage } from '../lib/db';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const syncService = {
    // Vérifie si le navigateur est en ligne
    isOnline: () => navigator.onLine,

    // Synchronise les commandes en attente
    syncOrders: async (token) => {
        if (!navigator.onLine) return;

        const pendingOrders = await offlineStorage.getQueuedOrders();
        if (pendingOrders.length === 0) return;

        console.log(`🔄 Synchronisation de ${pendingOrders.length} commandes...`);

        for (const order of pendingOrders) {
            try {
                const response = await axios.post(`${API_URL}/orders`, {
                    items: order.items,
                    isOfflineSync: true // Flag pour le backend si besoin
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 201) {
                    await offlineStorage.markOrderSynced(order.id);
                    console.log(`✅ Commande ${order.id} synchronisée.`);
                }
            } catch (error) {
                console.error(`❌ Échec de synchro pour la commande ${order.id}:`, error.message);
                // On garde la commande en 'pending' pour la prochaine tentative
            }
        }
    },

    // Écouteurs d'événements réseau
    init: (onStatusChange) => {
        window.addEventListener('online', () => onStatusChange(true));
        window.addEventListener('offline', () => onStatusChange(false));
    }
};
