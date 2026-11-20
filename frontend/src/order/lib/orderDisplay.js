/** Masque téléphone chiffré ou hash technique */
export function formatDisplayPhone(phone) {
    if (!phone || typeof phone !== 'string') return '—';
    const trimmed = phone.trim();
    if (trimmed.includes(':') || /^[a-f0-9]{32,}/i.test(trimmed) || trimmed.length > 18) {
        return 'Tél. masqué';
    }
    return trimmed;
}

export const ITEM_STATUS_LABELS = {
    en_attente: 'En attente',
    confirme: 'Confirmé',
    prepare: 'Préparé',
    expedie: 'Expédié',
    livre: 'Livré',
    annule: 'Annulé',
    retourne: 'Retourné',
};

export const LOGISTICS_LABELS = {
    en_attente: 'En attente',
    pret: 'Prêt livreur',
    ramasse: 'Ramassé',
    en_route: 'En route',
    en_cours: 'En cours',
    livre: 'Livré',
};

export function groupVendorOrderItems(items) {
    const map = new Map();
    for (const item of items) {
        const id = item.commande_id;
        if (!map.has(id)) {
            map.set(id, {
                commande_id: id,
                commande: item.commande || item.Order,
                items: [],
            });
        }
        map.get(id).items.push(item);
    }
    return Array.from(map.values()).sort((a, b) => {
        const da = new Date(a.commande?.date_commande || a.commande?.createdAt || 0);
        const db = new Date(b.commande?.date_commande || b.commande?.createdAt || 0);
        return db - da;
    });
}
