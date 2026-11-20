import { BCA_CATEGORIES } from './categoryConstants';
import { getSubSectionsForCategory } from '../../landing/lib/bcaLandingContent';

export const FOR_YOU_ID = 'for-you';

/**
 * Normalise une chaîne pour comparaison stricte : minuscules, sans accents,
 * espaces superflus supprimés. Permet de comparer "Électronique" et
 * "electronique" comme identiques, sans jamais faire de correspondance
 * partielle hasardeuse (qui mélangeait des catégories entre elles).
 */
function normalize(str = '') {
    return str
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();
}

function backendCategoryName(c) {
    return c.nom_categorie || c.nom || c.name || '';
}

/**
 * Trouve la catégorie backend correspondant à une catégorie BCA par
 * correspondance EXACTE de nom (normalisée). Le backend (defaultCategories.js)
 * est initialisé avec des noms identiques à BCA_CATEGORIES : la correspondance
 * exacte est donc fiable et ne peut jamais faire correspondre deux catégories
 * différentes entre elles (contrairement à l'ancien matching par sous-chaîne).
 */
function findExactBackendMatch(bcaCat, raw) {
    const target = normalize(bcaCat.nom);
    return raw.find((c) => normalize(backendCategoryName(c)) === target);
}

/** Fusionne les catégories BCA avec les IDs / sous-catégories réelles de l'API */
export function mergeBackendCategories(raw = []) {
    if (!Array.isArray(raw) || raw.length === 0) return BCA_CATEGORIES;

    return BCA_CATEGORIES.map((bcaCat) => {
        const backendMatch = findExactBackendMatch(bcaCat, raw);
        return {
            ...bcaCat,
            id: backendMatch?.id || bcaCat.id,
            sous_categories: backendMatch?.sous_categories || [],
        };
    });
}

/**
 * Sous-catégories réelles pour le panneau mega-menu. On ne renvoie QUE les
 * sous-catégories qui appartiennent réellement à la catégorie survolée
 * (via son id, ou par correspondance exacte de nom). S'il n'en existe aucune
 * en base, on renvoie un tableau vide plutôt que des éléments génériques
 * appartenant à d'autres catégories.
 */
export function getMegaMenuSubItems(category, rawBackend = []) {
    const title = category?.nom || 'Catégories pour vous';

    if (!category || category.id === FOR_YOU_ID) {
        return getSubSectionsForCategory(title).map((item) => ({
            ...item,
            link: `/search?q=${encodeURIComponent(item.name)}`,
        }));
    }

    const backendCat = rawBackend.find((c) => c.id === category.id)
        || findExactBackendMatch(category, rawBackend);

    const subs = backendCat?.sous_categories || category.sous_categories || [];
    if (subs.length > 0) {
        return subs.map((sc) => ({
            id: sc.id,
            name: sc.nom_categorie || sc.nom || sc.name,
            image_url: sc.image_url,
            link: `/marketplace?category=${sc.id}`,
        }));
    }

    return [];
}
