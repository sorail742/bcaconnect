import { BCA_CATEGORIES } from './categoryConstants';
import { getSubSectionsForCategory } from './bcaLandingContent';

export const FOR_YOU_ID = 'for-you';

/** Fusionne les catégories BCA avec les IDs / sous-catégories de l'API */
export function mergeBackendCategories(raw = []) {
    if (!Array.isArray(raw) || raw.length === 0) return BCA_CATEGORIES;

    return BCA_CATEGORIES.map((bcaCat) => {
        const backendMatch = raw.find((c) => {
            const name = (c.nom_categorie || c.nom || c.name || '').toLowerCase();
            const filter = bcaCat.filter.toLowerCase();
            return name.includes(filter)
                || filter.split(' ').some((w) => w.length > 2 && name.includes(w));
        });
        return {
            ...bcaCat,
            id: backendMatch?.id || bcaCat.id,
            sous_categories: backendMatch?.sous_categories || [],
        };
    });
}

/** Sous-catégories pour le panneau mega-menu (API en priorité, fallback statique) */
export function getMegaMenuSubItems(category, rawBackend = []) {
    const title = category?.nom || 'Catégories pour vous';

    if (!category || category.id === FOR_YOU_ID) {
        return getSubSectionsForCategory(title).map((item) => ({
            ...item,
            link: `/search?q=${encodeURIComponent(item.name)}`,
        }));
    }

    const backendCat = rawBackend.find((c) => c.id === category.id)
        || rawBackend.find((c) => {
            const name = (c.nom_categorie || '').toLowerCase();
            return name.includes((category.filter || category.nom || '').toLowerCase().split(' ')[0]);
        });

    const subs = backendCat?.sous_categories || category.sous_categories || [];
    if (subs.length > 0) {
        return subs.map((sc) => ({
            id: sc.id,
            name: sc.nom_categorie || sc.nom || sc.name,
            image_url: sc.image_url,
            link: `/marketplace?category=${sc.id}`,
        }));
    }

    return getSubSectionsForCategory(title).map((item) => ({
        ...item,
        link: `/search?q=${encodeURIComponent(item.name)}`,
    }));
}
