const UNITS = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const TEENS = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

/**
 * Convertit un nombre de 0 à 999 en lettres.
 * @param {number} n
 * @param {boolean} isFinal - true si ce groupe est le dernier segment non-nul du nombre complet
 *   (règle française : "cent" et "vingt" ne prennent un 's' que multipliés ET en fin de nombre —
 *   pas quand ils sont suivis de "mille"/"million"/"milliard" ou d'une unité).
 */
function chunkToWords(n, isFinal) {
    if (n === 0) return '';
    const parts = [];
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;

    if (hundreds > 0) {
        parts.push(hundreds === 1 ? 'cent' : UNITS[hundreds] + ' cent');
        if (hundreds > 1 && rest === 0 && isFinal) parts[parts.length - 1] += 's';
    }

    if (rest > 0) {
        if (rest < 10) {
            parts.push(UNITS[rest]);
        } else if (rest < 20) {
            parts.push(TEENS[rest - 10]);
        } else {
            const tensDigit = Math.floor(rest / 10);
            const unitDigit = rest % 10;
            if (tensDigit === 7 || tensDigit === 9) {
                // 71 = soixante et onze / 91 = quatre-vingt-onze (pas de "et" pour les formes en 80)
                const base = TENS[tensDigit];
                if (unitDigit === 0) parts.push(`${base}-dix`);
                else if (tensDigit === 7 && unitDigit === 1) parts.push(`${base} et onze`);
                else parts.push(`${base}-${TEENS[unitDigit]}`);
            } else {
                let word = TENS[tensDigit];
                const isQuatreVingt = tensDigit === 8;
                if (unitDigit === 1 && !isQuatreVingt) word += ' et un';
                else if (unitDigit > 0) word += `-${UNITS[unitDigit]}`;
                else if (isQuatreVingt && isFinal) word += 's';
                parts.push(word);
            }
        }
    }

    return parts.join(' ');
}

/** Convertit un entier positif en toutes lettres françaises (ex: 1500000 -> "un million cinq cent mille"). */
export function numberToWordsFr(value) {
    const n = Math.round(Math.abs(Number(value) || 0));
    if (n === 0) return 'zéro';

    const billions = Math.floor(n / 1_000_000_000);
    const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
    const thousands = Math.floor((n % 1_000_000) / 1_000);
    const units = n % 1_000;

    // "million"/"milliard" sont des noms (cent/vingt s'accordent normalement devant eux) ;
    // "mille" est un adjectif numéral invariable (cent/vingt ne s'accordent JAMAIS devant lui).
    const segments = [];
    if (billions > 0) {
        segments.push(`${chunkToWords(billions, true)} milliard${billions > 1 ? 's' : ''}`);
    }
    if (millions > 0) {
        segments.push(`${chunkToWords(millions, true)} million${millions > 1 ? 's' : ''}`);
    }
    if (thousands > 0) {
        segments.push(thousands === 1 ? 'mille' : `${chunkToWords(thousands, false)} mille`);
    }
    if (units > 0) {
        segments.push(chunkToWords(units, true));
    }

    return segments.join(' ').replace(/\s+/g, ' ').trim();
}

/** Formate un montant en lettres avec devise (ex: "un million cinq cent mille francs guinéens"). */
export function amountToWordsFr(value, currencyLabel = 'francs guinéens') {
    return `${numberToWordsFr(value)} ${currencyLabel}`;
}
