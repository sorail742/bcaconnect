/**
 * Informations légales et coordonnées officielles de BCA (Best Centrale d'Achat).
 * Source : gabarits officiels fournis par la Direction Générale
 * (frontend/docs/bcadonneesactuel/) — Facture, Facture Proforma, Bon de Commande.
 * Toute modification de ces valeurs doit être validée par la Direction.
 */
export const BCA_COMPANY = {
    nom: 'BCA',
    raisonSociale: 'Best Centrale d\'Achat',
    slogan: 'LA QUALITÉ AU MEILLEUR PRIX',
    accroche: 'Commander suffit, BCA s\'occupe du reste',
    baseline: 'BCA, la puissance de +100 fournisseurs professionnels mondiaux pour vos ambitions',
    site: 'www.bestcentrale.com',
    emails: ['bestcantraledachat@gmail.com', 'contact@bestcentrale.com'],
    telephones: ['+224 620 45 14 85', '611 11 22 17'],
    adresse: 'Gbessia Kondebougni, Matoto Conakry',
    capitalSocial: '50 000 000 GNF',
    rccm: 'GN.TCC.2021.B01853',
    nif: '288578388',
    cleTva: '4K',
    signataire: 'DIRECTEUR GENERAL',
};

// Bandeau de catégories affiché sous l'en-tête (Facture / Facture Proforma)
export const BCA_CATEGORIES_BANDEAU = [
    'Technologies & Digital',
    'Sécurité & Protection',
    'Energie & Logistique',
    'Bâtiment & Maintenance',
    'Administration & Bureau',
    'produits locaux',
];

// Bandeau de secteurs affiché en pied de page (Facture / Facture Proforma)
export const BCA_SECTEURS_FOOTER = [
    'Administration', 'Technologie', 'Sécurité', 'Energie',
    'Bâtiment', 'Logistique', 'Industrie', 'Projets',
];

export const BCA_GARANTIE = {
    titre: 'Garantie Premium & Sérénité Totale',
    points: [
        '2 ans de garantie légale de conformité aux normes CE/ISO',
        '2 ans de garantie légale contre tout vice caché, à compter de la livraison',
    ],
    engagementsTitre: 'Nos Engagements envers vous',
    engagements: [
        'Remplacement immédiat en cas de défaut',
        'Réparation professionnelle pour assurer la performance optimale',
        'Remboursement intégral si aucune solution ne vous satisfait',
    ],
    signature: 'Avec nous, votre investissement est protégé, votre confiance honorée',
};

export const BCA_MENTION_CONFORMITE_BON_COMMANDE =
    'Les informations figurant sur le présent bon de commande doivent être strictement conformes aux '
    + 'articles livrés. Toute non-conformité imputable au fournisseur entraîne des préjudices pour notre '
    + 'société. Les frais d\'échanges ou de corrections seront intégralement à la charge du fournisseur.';
