/**
 * Matrice des permissions par rôle (RBAC)
 */
const permissions = {
    // Permissions Administrateur : Peut tout faire
    admin: [
        'manage_users',
        'manage_categories',
        'manage_all_orders',
        'view_all_transactions',
        'solve_disputes',
        'view_admin_dashboard',
        'manage_ads'
    ],

    // Permissions Vendeur (Fournisseur)
    fournisseur: [
        'manage_own_products',
        'view_own_orders',
        'update_order_item_status',
        'view_vendor_insights',
        'manage_own_store'
    ],

    // Permissions Transporteur
    transporteur: [
        'view_available_deliveries',
        'assign_delivery',
        'update_delivery_status',
        'verify_delivery_otp'
    ],

    // Permissions Client
    client: [
        'place_orders',
        'view_own_profile',
        'view_own_history',
        'credit_wallet_request',
        'report_dispute'
    ]
};

/**
 * Vérifie si un rôle possède une permission spécifique
 * @param {string} role - Le rôle de l'utilisateur
 * @param {string} permission - La permission à vérifier
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
    if (role === 'admin') return true; // L'admin a toutes les permissions implicitement
    if (!permissions[role]) return false;
    return permissions[role].includes(permission);
};

module.exports = { permissions, hasPermission };
