/**
 * Matrice de permissions RBAC pour BCA Connect
 * Définition des actions par rôle
 */

const permissions = {
    // Actions sur le catalogue de produits
    PRODUCTS_VIEW: ['admin', 'fournisseur', 'transporteur', 'client', 'banque'],
    PRODUCTS_CREATE: ['admin', 'fournisseur'],
    PRODUCTS_EDIT_OWN: ['admin', 'fournisseur'],
    PRODUCTS_DELETE_OWN: ['admin', 'fournisseur'],
    PRODUCTS_APPROVE: ['admin'],

    // Actions sur les boutiques
    STORE_VIEW: ['admin', 'fournisseur', 'transporteur', 'client', 'banque'],
    STORE_CREATE: ['fournisseur'],
    STORE_EDIT_OWN: ['admin', 'fournisseur'],

    // Actions sur les commandes
    ORDERS_CREATE: ['admin', 'client'],
    ORDERS_VIEW_OWN: ['admin', 'fournisseur', 'transporteur', 'client'],
    ORDERS_UPDATE_STATUS: ['admin', 'fournisseur', 'transporteur'],

    // Actions sur le portefeuille et transactions
    WALLET_VIEW_OWN: ['admin', 'fournisseur', 'transporteur', 'client', 'banque'],
    TRANSACTION_HISTORY: ['admin', 'fournisseur', 'transporteur', 'client', 'banque'],
    WITHDRAW_FUNDS: ['admin', 'fournisseur', 'transporteur', 'banque'],

    // Logistique
    DELIVERY_MANAGE: ['admin', 'transporteur'],

    // Administration
    USER_MANAGE: ['admin'],
    SYSTEM_SETTINGS: ['admin'],
    AUDIT_LOGS_VIEW: ['admin']
};

/**
 * Middleware de vérification de permission granulaire
 * @param {string} permissionKey - La clé de la permission à vérifier
 */
const checkPermission = (permissionKey) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const allowedRoles = permissions[permissionKey];

        if (!allowedRoles) {
            return res.status(500).json({ message: "Clé de permission invalide." });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Vous n'avez pas la permission d'effectuer cette action.",
                requiredPermission: permissionKey
            });
        }
        next();
    };
};

module.exports = { permissions, checkPermission };
