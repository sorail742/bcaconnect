import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Store global pour la gestion de la Wishlist.
 * Puisqu'il n'y a pas encore d'API dédiée, nous utilisons le localStorage
 * pour offrir une expérience persistante et professionnelle.
 */
const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [],

            /**
             * Ajoute ou retire un produit de la wishlist (toggle).
             */
            toggleItem: (product) => {
                const { items } = get();
                const exists = items.find(item => item.id === product.id);

                if (exists) {
                    set({ items: items.filter(item => item.id !== product.id) });
                    return false; // Retiré
                } else {
                    set({ items: [...items, product] });
                    return true; // Ajouté
                }
            },

            /**
             * Vérifie si un produit est dans la wishlist.
             */
            isInWishlist: (productId) => {
                return get().items.some(item => item.id === productId);
            },

            /**
             * Vide la wishlist.
             */
            clearWishlist: () => {
                set({ items: [] });
            }
        }),
        {
            name: 'bca-wishlist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useWishlistStore;
