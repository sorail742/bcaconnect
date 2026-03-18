import Dexie from 'dexie';

export const db = new Dexie('BCADatabase');

// Définition du schéma de la base de données
db.version(1).stores({
    products: 'id, nom, prix_unitaire, categorie_id, store_id', // Cache catalogue
    categories: 'id, nom_categorie', // Cache catégories
    orders_queue: '++id, status, items, total_ttc, timestamp', // File d'attente des commandes offline
    transactions: '++id, type, montant, date', // Cache historique financier
    user_prefs: 'key, value', // Préférences et thèmes offline
});

// Méthodes utilitaires
export const offlineStorage = {
    // Produits
    saveProducts: async (products) => {
        return await db.products.bulkPut(products);
    },
    getProducts: async () => {
        return await db.products.toArray();
    },

    // Commandes
    queueOrder: async (orderData) => {
        return await db.orders_queue.add({
            ...orderData,
            status: 'pending',
            timestamp: Date.now(),
        });
    },
    getQueuedOrders: async () => {
        return await db.orders_queue.where('status').equals('pending').toArray();
    },
    markOrderSynced: async (id) => {
        return await db.orders_queue.update(id, { status: 'synced' });
    },

    // Transactions
    saveTransactions: async (transactions) => {
        return await db.transactions.bulkPut(transactions);
    },
    getTransactions: async () => {
        return await db.transactions.reverse().sortBy('date');
    },

    // Catégories
    saveCategories: async (categories) => {
        return await db.categories.bulkPut(categories);
    },
    getCategories: async () => {
        return await db.categories.toArray();
    }
};
