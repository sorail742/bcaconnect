/**
 * Service pour la transformation des données du panier.
 * Assure la compatibilité entre le store frontend et l'API /orders.
 */
const cartService = {
    /**
     * Prépare les données pour la création d'une commande.
     * @param {Array} cartItems - Liste des items du cartStore.
     * @param {Object} deliveryInfo - { nom, telephone, adresse }
     * @param {string} paymentMethod - 'wallet' par défaut.
     * @returns {Object} Payload formaté pour l'API.
     */
    formatOrderData: (cartItems, deliveryInfo, paymentMethod = 'wallet', typeLivraison = 'standard') => {
        return {
            items: cartItems.map(item => ({
                productId: item.id || item.productId || item.product_id,
                quantity: item.quantity
            })),
            deliveryInfo: {
                nom: deliveryInfo.nom,
                telephone: deliveryInfo.telephone,
                adresse: deliveryInfo.adresse
            },
            type_livraison: typeLivraison,
            paymentMethod,
            // Génération d'une clé d'idempotence pour éviter les doubles commandes
            cle_idempotence: `BCA-${Date.now()}-${Math.random().toString(36).substring(7)}`
        };
    }
};

export default cartService;
