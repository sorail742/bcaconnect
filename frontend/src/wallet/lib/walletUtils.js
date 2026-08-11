const CREDIT_TYPES = new Set([
    'depot',
    'remboursement',
    'credit_financement',
    'credit',
]);

const TYPE_LABELS = {
    depot: 'Dépôt',
    retrait: 'Retrait',
    achat_produit: 'Achat produit',
    achat_groupe_engagement: 'Engagement achat groupé',
    remboursement: 'Remboursement',
    credit_financement: 'Crédit approuvé',
    frais_livraison: 'Frais livraison',
    prestation_technique: 'Prestation technique',
};

/** Direction crédit/débit à partir de type_transaction API */
export function getTransactionDirection(tx) {
    const type = tx?.type_transaction || tx?.type || '';
    if (CREDIT_TYPES.has(type)) return 'credit';
    return 'debit';
}

export function getTransactionLabel(tx) {
    const type = tx?.type_transaction || tx?.type;
    return tx?.description || TYPE_LABELS[type] || type || 'Transaction';
}
