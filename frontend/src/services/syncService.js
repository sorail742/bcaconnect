import { offlineStorage } from '../lib/db';
import axios from 'axios';
import { toast } from 'sonner';

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
                    toast.success("Votre commande hors-ligne a été synchronisée avec succès !");
                }
            } catch (error) {
                console.error(`❌ Échec de synchro pour la commande ${order.id}:`, error.message);
                
                // Interception des erreurs de stock (400) ou validation (422) depuis le backend
                if (error.response && (error.response.status === 400 || error.response.status === 422)) {
                    const messageErreur = error.response.data?.message || "Erreur de validation système.";
                    
                    // On modifie l'état local pour empêcher la boucle infinie. 
                    await offlineStorage.markOrderFailed(order.id, messageErreur);
                    console.warn(`⚠️ Commande ${order.id} marquée comme échouée : ${messageErreur}`);
                    
                    // Notification UX claire pour l'utilisateur
                    toast.error("Produit indisponible. Votre commande n'a pas pu être finalisée.", { 
                        duration: 8000, 
                        description: messageErreur 
                    });
                }
                // Si l'erreur est une perte de connexion réseau (503, timeout...), la commande reste simplement en 'pending' pour une future tentative.
            }
        }
    },

    // Écouteurs d'événements réseau
    init: (onStatusChange) => {
        window.addEventListener('online', () => onStatusChange(true));
        window.addEventListener('offline', () => onStatusChange(false));
    }
};
