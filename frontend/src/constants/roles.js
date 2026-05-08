export const ROLES = {
    ADMIN: 'admin',
    FOURNISSEUR: 'fournisseur',
    TRANSPORTEUR: 'transporteur',
    CLIENT: 'client',
    BANQUE: 'banque',
};

export const ROLE_LABELS = {
    [ROLES.ADMIN]: 'Administrateur',
    [ROLES.FOURNISSEUR]: 'Marchand',
    [ROLES.TRANSPORTEUR]: 'Transporteur',
    [ROLES.CLIENT]: 'Client',
    [ROLES.BANQUE]: 'Banque',
};

export const getDashboardRoute = (role) => {
    switch (role) {
        case ROLES.ADMIN: return '/admin/dashboard';
        case ROLES.FOURNISSEUR: return '/vendor/dashboard';
        case ROLES.TRANSPORTEUR: return '/carrier/dashboard';
        case ROLES.BANQUE: return '/bank/dashboard';
        default: return '/dashboard';
    }
};
