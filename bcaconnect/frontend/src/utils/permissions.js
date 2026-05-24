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
    CAN_VIEW_WALLET: ['admin', 'fournisseur', 'transporteur', 'client', 'banque'],
    CAN_WITHDRAW: ['fournisseur', 'transporteur', 'banque', 'admin'],

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
