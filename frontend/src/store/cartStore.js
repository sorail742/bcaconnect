import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Store global pour la gestion du panier (Cart).
 * Version : 1.0 (Dynamique & Persistant)
 */
const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            total: 0,
            itemCount: 0,
            typeLivraison: 'standard',
            deliveryFee: 50000,

            setDelivery: (typeLivraison, deliveryFee) => {
                set({ typeLivraison, deliveryFee: parseFloat(deliveryFee) || 0 });
            },

            /**
              * Ajoute un produit au panier ou incrémente sa quantité.
              */
            addItem: (product, quantity = 1) => {
                const { items } = get();
                const normalized = {
                    ...product,
                    nom_produit: product.nom_produit || product.name || 'Produit',
                    prix_unitaire: product.prix_unitaire ?? product.price ?? 0,
                    image_url: product.image_url || product.image || product.images?.[0]?.url_image,
                };
                const existingItem = items.find(item => item.id === normalized.id);

                let newItems;
                if (existingItem) {
                    newItems = items.map(item =>
                        item.id === normalized.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    newItems = [...items, { ...normalized, quantity }];
                }

                set({ items: newItems });
                get().calculateTotals();
            },

            /**
             * Supprime un produit du panier.
             */
            removeItem: (productId) => {
                set({
                    items: get().items.filter(item => item.id !== productId)
                });
                get().calculateTotals();
            },

            /**
             * Met à jour la quantité d'un produit.
             */
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: get().items.map(item => 
                        item.id === productId ? { ...item, quantity } : item
                    )
                });
                get().calculateTotals();
            },

            /**
             * Vide complètement le panier.
             */
            clearCart: () => {
                set({ items: [], total: 0, itemCount: 0 });
            },

            /**
             * Recalcule le total et le nombre d'articles.
             */
            calculateTotals: () => {
                const { items } = get();
                const total = items.reduce((acc, item) => acc + (parseFloat(item.prix_unitaire || 0) * item.quantity), 0);
                const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
                set({ total, itemCount });
            }
        }),
        {
            name: 'bca-cart-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (!state?.items?.length) return;
                state.items = state.items.map((item) => ({
                    ...item,
                    nom_produit: item.nom_produit || item.name || 'Produit',
                    prix_unitaire: item.prix_unitaire ?? item.price ?? 0,
                    image_url: item.image_url || item.image,
                }));
                state.total = state.items.reduce(
                    (acc, item) => acc + parseFloat(item.prix_unitaire || 0) * item.quantity, 0,
                );
                state.itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);
            },
        }
    )
);

export default useCartStore;
