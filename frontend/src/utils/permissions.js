/**
 * Matrice des permissions côté Frontend
 * Permet de masquer/afficher des éléments d'interface selon le rôle
 */

export const PERMISSIONS = {
    // Catalogue
    CAN_ADD_PRODUCT: ['admin', 'fournisseur'],
    CAN_EDIT_PRODUCT: ['admin', 'fournisseur'],
    CAN_DELETE_PRODUCT: ['admin', 'fournisseur'],

    // Boutique
    CAN_MANAGE_STORE: ['admin', 'fournisseur'],

    // Commandes
    CAN_BUY: ['client', 'admin'],
    CAN_SHIP: ['transporteur', 'admin'],

    // Finance
    CAN_VIEW_WALLET: ['admin', 'fournisseur', 'transporteur', 'client', 'banque', 'technicien'],
    CAN_WITHDRAW: ['fournisseur', 'transporteur', 'banque', 'admin', 'technicien'],

    // Technicien SAV
    CAN_ACCEPT_MISSION: ['technicien', 'admin'],
    CAN_COMPLETE_MISSION: ['technicien', 'admin'],

    // Group Purchases (aligné AppRoutes)
    CAN_ACCESS_GROUP_PURCHASE: ['admin', 'client', 'fournisseur', 'banque', 'technicien'],

    // Admin
    CAN_ACCESS_ADMIN_PANEL: ['admin'],
};

/**
 * Helper pour vérifier une permission
 * @param {Object} user - L'objet utilisateur du contexte auth
 * @param {string} permissionKey - La clé de permission
 * @returns {boolean}
 */
export const hasPermission = (user, permissionKey) => {
    if (!user || !user.role) return false;
    const allowedRoles = PERMISSIONS[permissionKey];
    return allowedRoles ? allowedRoles.includes(user.role) : false;
};
