import { useAuth } from './useAuth';

/**
 * Matrice des permissions par rôle (Doit être identique à celle du backend)
 */
const PERMISSIONS = {
    admin: [
        'manage_users', 'manage_categories', 'manage_all_orders',
        'view_all_transactions', 'solve_disputes', 'view_admin_dashboard', 'manage_ads'
    ],
    fournisseur: [
        'manage_own_products', 'view_own_orders', 'update_order_item_status',
        'view_vendor_insights', 'manage_own_store'
    ],
    transporteur: [
        'view_available_deliveries', 'assign_delivery', 'update_delivery_status', 'verify_delivery_otp'
    ],
    client: [
        'place_orders', 'view_own_profile', 'view_own_history', 'credit_wallet_request', 'report_dispute'
    ]
};

export const useRBAC = () => {
    const { user } = useAuth();

    /**
     * Vérifie si l'utilisateur actuel possède une permission
     * @param {string} permission 
     * @returns {boolean}
     */
    const can = (permission) => {
        if (!user || !user.role) return false;
        if (user.role === 'admin') return true;

        const rolePermissions = PERMISSIONS[user.role] || [];
        return rolePermissions.includes(permission);
    };

    /**
     * Vérifie si l'utilisateur possède l'un des rôles spécifiés
     * @param {string[]} roles 
     * @returns {boolean}
     */
    const is = (roles) => {
        if (!user || !user.role) return false;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return allowedRoles.includes(user.role);
    };

    return { can, is, role: user?.role };
};

/**
 * Composant de rendu conditionnel basé sur les permissions
 */
export const Can = ({ perform, children, fallback = null }) => {
    const { can } = useRBAC();
    return can(perform) ? children : fallback;
};
