/** Taxonomie BCA standard — alignée avec frontend/src/category/lib/categoryConstants.jsx */
const DEFAULT_CATEGORIES = [
    'Vêtements & Accessoires',
    'Électronique grand public',
    'Maison & Jardin',
    'Sports & Loisirs',
    'Bijoux, Lunettes & Montres',
    "Tenues de sport et vêtements d'extérieur",
    'Produits de beauté',
    'Équipements & Fournitures Électriques',
    'Sûreté & sécurité',
    'Manutention',
    'Instrument & Équipement de test',
    "Transmission d'énergie",
    'Composants électroniques',
    'Véhicules et transport',
    'Agriculture, Aliments & Boissons',
    'Matières premières',
    'Services de fabrication',
    'Service',
    'Chaussures & Accessoires',
    'Bagages, Sacs, Étuis',
    'Emballage & Impression',
    'Parents, Enfants & Jouets',
    'Hygiène perso & Ménage',
    'Médical & Santé',
    'Cadeaux & Artisanat',
    'Animalerie',
    'Fournitures de bureau',
    'Machines industrielles',
    'Équipements et machines commerciaux',
    'Machines pour le Bâtiment & la Construction',
    'Construction & Immobilier',
    'Meubles',
    'Lumière & Éclairage',
    'Électroménager',
    'Fournitures & Outils auto',
    'Pièces & Accessoires pour véhicules',
    'Bricolage & Quincaillerie',
    'Énergies renouvelables',
];

async function ensureDefaultCategories(Category) {
    const count = await Category.count();
    if (count > 0) return;

    for (const nom_categorie of DEFAULT_CATEGORIES) {
        await Category.findOrCreate({
            where: { nom_categorie },
            defaults: {
                nom_categorie,
                description: `Catégorie standard BCA Connect : ${nom_categorie}`,
            },
        });
    }
    console.log(`📂 ${DEFAULT_CATEGORIES.length} catégories par défaut initialisées.`);
}

module.exports = { DEFAULT_CATEGORIES, ensureDefaultCategories };
