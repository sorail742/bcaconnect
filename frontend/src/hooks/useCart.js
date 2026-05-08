import useCartStore from '../store/cartStore';

/**
 * Hook personnalisé pour interagir avec le panier.
 * Abstraction du store Zustand pour faciliter l'accès aux données et actions.
 */
const useCart = () => {
    const cartItems = useCartStore((state) => state.items);
    const cartTotal = useCartStore((state) => state.total);
    const totalQuantity = useCartStore((state) => state.itemCount);
    
    // Actions
    const addToCart = useCartStore((state) => state.addItem);
    const removeFromCart = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const clearCart = useCartStore((state) => state.clearCart);

    return {
        cartItems,
        cartTotal,
        totalQuantity,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isEmpty: cartItems.length === 0,
    };
};

export default useCart;
