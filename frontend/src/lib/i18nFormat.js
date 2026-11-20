// Résolution centralisée locale <-> code langue BCA Connect (FR/EN/SO/PE/MA).
// SO/PE/MA (Soussou, Pular, Malinké) n'ont pas de convention numérique/monétaire
// distincte de l'usage courant en Guinée : on aligne leur formatage sur 'fr-GN'.
const LOCALE_MAP = {
    FR: 'fr-GN',
    EN: 'en-US',
    SO: 'fr-GN',
    PE: 'fr-GN',
    MA: 'fr-GN',
};

export const getLocale = (lang) => LOCALE_MAP[lang] || 'fr-GN';

export const formatNumber = (value, lang, options = {}) => {
    const num = Number(value) || 0;
    return num.toLocaleString(getLocale(lang), options);
};

export const formatCurrency = (value, lang, currency = 'GNF') => {
    const num = Number(value) || 0;
    return `${formatNumber(num, lang, { maximumFractionDigits: 0 })} ${currency}`;
};

export const formatDate = (date, lang, options = {}) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(getLocale(lang), options);
};

export const formatDateTime = (date, lang, options = {}) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(getLocale(lang), options);
};
