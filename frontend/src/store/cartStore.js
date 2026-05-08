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

            /**
              * Ajoute un produit au panier ou incrémente sa quantité.
              */
            addItem: (product, quantity = 1) => {
                const { items } = get();
                const existingItem = items.find(item => item.id === product.id);

                let newItems;
                if (existingItem) {
                    newItems = items.map(item => 
                        item.id === product.id 
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    newItems = [...items, { ...product, quantity }];
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
        }
    )
);

export default useCartStore;
