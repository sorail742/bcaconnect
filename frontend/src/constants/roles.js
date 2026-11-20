export const ROLES = {
    ADMIN: 'admin',
    FOURNISSEUR: 'fournisseur',
    TRANSPORTEUR: 'transporteur',
    CLIENT: 'client',
    TECHNICIEN: 'technicien',
    BANQUE: 'banque',
};

export const ROLE_LABELS = {
    [ROLES.ADMIN]: 'Administrateur',
    [ROLES.FOURNISSEUR]: 'Marchand',
    [ROLES.TRANSPORTEUR]: 'Transporteur',
    [ROLES.CLIENT]: 'Client',
    [ROLES.TECHNICIEN]: 'Technicien',
    [ROLES.BANQUE]: 'Banque',
};

export const getDashboardRoute = (role) => {
    switch (role) {
        case ROLES.ADMIN: return '/admin/dashboard';
        case ROLES.FOURNISSEUR: return '/vendor/dashboard';
        case ROLES.TRANSPORTEUR: return '/carrier/dashboard';
        case ROLES.BANQUE: return '/bank/dashboard';
        case ROLES.TECHNICIEN: return '/technician/dashboard';
        default: return '/dashboard';
    }
};

/** Rôles autorisés à utiliser le panier marketplace */
export const SHOPPING_ROLES = [ROLES.CLIENT];

export const canUseCart = (role) => SHOPPING_ROLES.includes(role);

export const getOrdersRoute = (role) => {
    switch (role) {
        case ROLES.FOURNISSEUR: return '/vendor/orders';
        case ROLES.ADMIN: return '/admin/dashboard';
        default: return '/orders';
    }
};

export const getWalletRoute = (role) => {
    switch (role) {
        case ROLES.TECHNICIEN: return '/technician/wallet';
        default: return '/wallet';
    }
};
