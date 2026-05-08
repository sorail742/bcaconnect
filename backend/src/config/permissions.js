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
    ],

    // Permissions Banque
    banque: [
        'view_financial_reports',
        'view_all_transactions',
        'manage_credits',
        'view_admin_dashboard'
    ]
};

/**
 * Vérifie si un rôle possède une permission spécifique
 * @param {string} role - Le rôle de l'utilisateur
 * @param {string} permission - La permission à vérifier
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
    // Si le rôle est absent, on bloque par défaut par sécurité
    if (!role) {
        console.warn(`[PERM] Tentative d'accès sans rôle défini pour la permission: ${permission}`);
        return false;
    }
    
    // Normalisation (force string + lowercase)
    const normalizedRole = String(role).toLowerCase();
    
    // Règle d'or : l'admin a TOUJOURS toutes les permissions
    if (normalizedRole === 'admin') return true;
    
    if (!permissions[normalizedRole]) return false;
    return permissions[normalizedRole].includes(permission);
};

module.exports = { permissions, hasPermission };
