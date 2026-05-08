/**
 * Formate un montant en GNF
 */
export const formatCurrency = (amount, locale = 'fr-GN') => {
    return parseFloat(amount || 0).toLocaleString(locale);
};

/**
 * Formate une date en français
 */
export const formatDate = (dateStr, options = {}) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-GN', options);
};

/**
 * Formate une date + heure
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('fr-GN')} ${d.toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Tronque un texte à une longueur donnée
 */
export const truncate = (str, maxLength = 50) => {
    if (!str) return '';
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

/**
 * Retourne les initiales d'un nom complet
 */
export const getInitials = (fullName = '') => {
    return fullName
        .split(' ')
        .slice(0, 2)
        .map(n => n[0]?.toUpperCase() || '')
        .join('');
};
