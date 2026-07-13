/**
 * Peuple la table categories avec la taxonomie BCA standard.
 * Usage : node scripts/seed-categories.js  (depuis backend/)
 */
const { Category, sequelize } = require('../src/models');

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

async function seedCategories() {
    try {
        await sequelize.authenticate();
        let created = 0;
        let skipped = 0;

        for (const nom of DEFAULT_CATEGORIES) {
            const [, wasCreated] = await Category.findOrCreate({
                where: { nom_categorie: nom },
                defaults: {
                    nom_categorie: nom,
                    description: `Catégorie standard BCA Connect : ${nom}`,
                },
            });
            if (wasCreated) created += 1;
            else skipped += 1;
        }

        console.log(`✅ Catégories : ${created} créées, ${skipped} déjà présentes (${DEFAULT_CATEGORIES.length} au total).`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur seed catégories :', error);
        process.exit(1);
    }
}

seedCategories();
