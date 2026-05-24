/**
 * BCA Connect — Attributs Dynamiques par Catégorie
 * 
 * Ce fichier définit les champs spécifiques à afficher dans le formulaire
 * d'ajout/modification d'un produit, selon la catégorie choisie.
 * 
 * Chaque attribut est défini avec :
 * - key       : identifiant unique (clé dans le JSON stocké en base)
 * - label     : libellé affiché à l'utilisateur
 * - type      : 'text' | 'number' | 'select' | 'year'
 * - options   : liste de valeurs (pour type 'select')
 * - placeholder : texte indicatif
 * - unit      : unité optionnelle (ex: "km", "m²")
 */

export const CATEGORY_ATTRIBUTES = [
    {
        // ── Véhicules & Transport ──────────────────────────────────────────
        keywords: ['véhicule', 'vehicle', 'voiture', 'auto', 'transport', 'moto', 'camion', 'bus', 'pickup', 'suv', 'berline', 'utilitaire'],
        label: 'Caractéristiques du Véhicule',
        color: 'blue',
        fields: [
            { key: 'marque', label: 'Marque', type: 'text', placeholder: 'Toyota, Mercedes, Renault...' },
            { key: 'modele', label: 'Modèle', type: 'text', placeholder: 'Hilux, Sprinter, Clio...' },
            { key: 'annee', label: 'Année', type: 'year', placeholder: '2020' },
            { key: 'kilometrage', label: 'Kilométrage', type: 'number', placeholder: '45000', unit: 'km' },
            {
                key: 'motorisation', label: 'Motorisation', type: 'select',
                options: ['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL']
            },
            {
                key: 'boite_vitesse', label: 'Boîte de Vitesse', type: 'select',
                options: ['Manuelle', 'Automatique', 'Semi-automatique']
            },
            { key: 'couleur', label: 'Couleur', type: 'text', placeholder: 'Blanc, Gris Métallisé...' },
            {
                key: 'etat', label: 'État du Véhicule', type: 'select',
                options: ['Neuf', 'Très bon état', 'Bon état', 'Correct', 'Pour pièces']
            },
            { key: 'puissance', label: 'Puissance', type: 'text', placeholder: '150 ch', unit: 'ch' },
            { key: 'nb_places', label: 'Nombre de Places', type: 'number', placeholder: '5' },
        ]
    },
    {
        // ── Informatique & Électronique ────────────────────────────────────
        keywords: ['informatique', 'ordinateur', 'laptop', 'pc', 'ordinateurs', 'composant', 'électronique', 'électronique grand'],
        label: 'Caractéristiques Techniques',
        color: 'purple',
        fields: [
            { key: 'marque', label: 'Marque', type: 'text', placeholder: 'HP, Dell, Lenovo, Apple...' },
            { key: 'modele', label: 'Modèle / Référence', type: 'text', placeholder: 'XPS 15, ThinkPad X1...' },
            { key: 'processeur', label: 'Processeur (CPU)', type: 'text', placeholder: 'Intel Core i7-12700H' },
            { key: 'ram', label: 'Mémoire RAM', type: 'text', placeholder: '16 Go DDR4', unit: 'Go' },
            { key: 'stockage', label: 'Stockage', type: 'text', placeholder: '512 Go SSD NVMe' },
            { key: 'ecran', label: "Taille d'Écran", type: 'text', placeholder: '15.6"', unit: '"' },
            { key: 'gpu', label: 'Carte Graphique (GPU)', type: 'text', placeholder: 'NVIDIA RTX 3060' },
            { key: 'os', label: "Système d'Exploitation", type: 'text', placeholder: 'Windows 11, Ubuntu...' },
            { key: 'couleur', label: 'Couleur', type: 'text', placeholder: 'Argent, Noir...' },
            {
                key: 'etat', label: 'État', type: 'select',
                options: ['Neuf sous blister', 'Neuf sans emballage', 'Reconditionnée', 'Occasion très bon état', 'Occasion bon état']
            },
            { key: 'garantie', label: 'Garantie', type: 'text', placeholder: '12 mois, 24 mois...' },
        ]
    },
    {
        // ── Téléphones & Smartphones ───────────────────────────────────────
        keywords: ['téléphone', 'smartphone', 'mobile', 'iphone', 'android', 'telephone'],
        label: 'Caractéristiques du Téléphone',
        color: 'indigo',
        fields: [
            { key: 'marque', label: 'Marque', type: 'text', placeholder: 'Samsung, Apple, Xiaomi...' },
            { key: 'modele', label: 'Modèle', type: 'text', placeholder: 'Galaxy S24, iPhone 15 Pro...' },
            { key: 'memoire_interne', label: 'Mémoire Interne', type: 'text', placeholder: '128 Go', unit: 'Go' },
            { key: 'ram', label: 'RAM', type: 'text', placeholder: '8 Go', unit: 'Go' },
            { key: 'ecran', label: "Taille d'Écran", type: 'text', placeholder: '6.7"', unit: '"' },
            { key: 'batterie', label: 'Batterie', type: 'text', placeholder: '5000 mAh', unit: 'mAh' },
            { key: 'couleur', label: 'Couleur', type: 'text', placeholder: 'Midnight Black, Blanc Titane...' },
            {
                key: 'etat', label: 'État', type: 'select',
                options: ['Neuf sous blister', 'Neuf sans emballage', 'Reconditionné A+', 'Occasion très bon état', 'Occasion bon état']
            },
            {
                key: 'dual_sim', label: 'Double SIM', type: 'select',
                options: ['Oui', 'Non']
            },
            { key: 'reseau', label: 'Réseau', type: 'text', placeholder: '5G, 4G LTE...' },
            { key: 'garantie', label: 'Garantie', type: 'text', placeholder: '12 mois...' },
        ]
    },
    {
        // ── Alimentation, Agriculture & Produits Frais ─────────────────────
        keywords: ['agriculture', 'aliment', 'boisson', 'fruits', 'légumes', 'épicerie', 'vivrier', 'mangue', 'riz', 'poisson', 'viande', 'céréale', 'alimentation'],
        label: "Caractéristiques du Produit Alimentaire",
        color: 'green',
        fields: [
            { key: 'variete', label: 'Variété / Type', type: 'text', placeholder: 'Mangue Kent, Riz Basmati...' },
            { key: 'poids_net', label: 'Poids Net', type: 'text', placeholder: '5 Kg, 500g...', unit: 'Kg' },
            { key: 'conditionnement', label: 'Conditionnement', type: 'text', placeholder: 'Sac, Filet, Caisse, Vrac...' },
            { key: 'origine', label: 'Origine / Provenance', type: 'text', placeholder: 'Guinée, Côte d\'Ivoire...' },
            {
                key: 'bio', label: 'Agriculture Biologique', type: 'select',
                options: ['Oui', 'Non', 'En cours de certification']
            },
            { key: 'date_recolte', label: 'Date de Récolte / Production', type: 'text', placeholder: 'Juin 2025' },
            { key: 'dlc', label: "Date Limite de Consommation", type: 'text', placeholder: '31/12/2025' },
            { key: 'conservation', label: 'Conditions de Conservation', type: 'text', placeholder: 'Lieu frais et sec, Réfrigéré...' },
        ]
    },
    {
        // ── Vêtements & Mode ───────────────────────────────────────────────
        keywords: ['vêtement', 'mode', 'textile', 'habit', 'tenue', 'chemise', 'pantalon', 'robe', 'jupe', 'blouson', 'manteau', 'sport ext', 'chaussure', 'basket', 'bijou', 'accessoire'],
        label: 'Caractéristiques du Vêtement',
        color: 'pink',
        fields: [
            { key: 'taille', label: 'Taille / Pointure', type: 'text', placeholder: 'S, M, L, XL, 42, 44...' },
            { key: 'couleur', label: 'Couleur', type: 'text', placeholder: 'Bleu marine, Rouge bordeaux...' },
            { key: 'matiere', label: 'Matière / Composition', type: 'text', placeholder: '100% Coton, Polyester...' },
            {
                key: 'genre', label: 'Genre', type: 'select',
                options: ['Homme', 'Femme', 'Enfant', 'Mixte / Unisexe']
            },
            { key: 'marque', label: 'Marque', type: 'text', placeholder: 'Nike, Zara, Sans marque...' },
            {
                key: 'etat', label: 'État', type: 'select',
                options: ['Neuf avec étiquette', 'Neuf sans étiquette', 'Très bon état', 'Bon état', 'Acceptable']
            },
            { key: 'entretien', label: 'Entretien', type: 'text', placeholder: 'Lavage main, 30°C maxi...' },
        ]
    },
    {
        // ── Immobilier & Construction ──────────────────────────────────────
        keywords: ['immobilier', 'construction', 'bâtiment', 'terrain', 'maison', 'appartement', 'villa', 'logement', 'location', 'bureau', 'local commercial'],
        label: 'Caractéristiques du Bien',
        color: 'amber',
        fields: [
            {
                key: 'type_bien', label: 'Type de Bien', type: 'select',
                options: ['Maison', 'Villa', 'Appartement', 'Studio', 'Terrain', 'Bureau', 'Local commercial', 'Entrepôt']
            },
            {
                key: 'type_offre', label: "Type d'Offre", type: 'select',
                options: ['À Vendre', 'À Louer', 'Colocation']
            },
            { key: 'surface', label: 'Surface', type: 'number', placeholder: '120', unit: 'm²' },
            { key: 'nb_pieces', label: 'Nombre de Pièces', type: 'number', placeholder: '4' },
            { key: 'nb_chambres', label: 'Nombre de Chambres', type: 'number', placeholder: '3' },
            { key: 'quartier', label: 'Quartier / Zone', type: 'text', placeholder: 'Kaloum, Ratoma...' },
            {
                key: 'meuble', label: 'Meublé', type: 'select',
                options: ['Oui', 'Non', 'Partiellement']
            },
            {
                key: 'etat', label: 'État du Bien', type: 'select',
                options: ['Neuf', 'Bon état', 'À rénover', 'En construction']
            },
        ]
    },
    {
        // ── Santé & Médical ────────────────────────────────────────────────
        keywords: ['médical', 'santé', 'médicament', 'pharmacie', 'hygiène', 'parapharmacie'],
        label: 'Informations Médicales / Santé',
        color: 'red',
        fields: [
            { key: 'contenance', label: 'Contenance / Dosage', type: 'text', placeholder: '250ml, 500mg...' },
            { key: 'composition', label: 'Composition / Principes actifs', type: 'text', placeholder: 'Paracétamol 500mg...' },
            { key: 'dlc', label: "Date de Péremption", type: 'text', placeholder: '06/2027' },
            {
                key: 'ordonnance', label: 'Ordonnance Requise', type: 'select',
                options: ['Non', 'Oui']
            },
            { key: 'fabricant', label: 'Fabricant / Laboratoire', type: 'text', placeholder: 'Sanofi, Pfizer...' },
            { key: 'pays_origine', label: "Pays d'Origine", type: 'text', placeholder: 'France, Inde...' },
        ]
    },
    {
        // ── Électroménager ─────────────────────────────────────────────────
        keywords: ['électroménager', 'réfrigérateur', 'climatiseur', 'lave-linge', 'télévision', 'tv', 'four', 'machine à laver', 'congélateur', 'lumière', 'éclairage'],
        label: "Caractéristiques de l'Appareil",
        color: 'cyan',
        fields: [
            { key: 'marque', label: 'Marque', type: 'text', placeholder: 'Samsung, LG, Whirlpool...' },
            { key: 'modele', label: 'Modèle / Référence', type: 'text', placeholder: 'WW90T534DAE...' },
            { key: 'capacite', label: 'Capacité / Taille', type: 'text', placeholder: '9 Kg, 300 L, 55"...' },
            { key: 'puissance', label: 'Puissance', type: 'text', placeholder: '2200W, 1.5 CV...' },
            { key: 'couleur', label: 'Couleur / Finition', type: 'text', placeholder: 'Blanc, Inox...' },
            {
                key: 'classe_energie', label: 'Classe Énergetique', type: 'select',
                options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'Non renseigné']
            },
            {
                key: 'etat', label: 'État', type: 'select',
                options: ['Neuf sous blister', 'Neuf sans emballage', 'Reconditionné', 'Occasion très bon état', 'Occasion bon état']
            },
            { key: 'garantie', label: 'Garantie', type: 'text', placeholder: '24 mois, 12 mois...' },
        ]
    },
    {
        // ── Matériaux & Construction ───────────────────────────────────────
        keywords: ['matériau', 'matière première', 'bois', 'métal', 'fer', 'ciment', 'sable', 'gravier', 'peinture', 'quincaillerie', 'bricolage'],
        label: 'Caractéristiques du Matériau',
        color: 'stone',
        fields: [
            { key: 'matiere', label: 'Matière / Composition', type: 'text', placeholder: 'Acier galvanisé, Bois teck...' },
            { key: 'dimensions', label: 'Dimensions', type: 'text', placeholder: '50x100x200 cm, 3m x 6m...' },
            { key: 'poids', label: 'Poids / Tonnage', type: 'text', placeholder: '25 Kg, 1 Tonne...', unit: 'Kg' },
            { key: 'quantite_min', label: 'Quantité Minimum de Commande', type: 'number', placeholder: '100' },
            { key: 'origine', label: "Pays / Région d'Origine", type: 'text', placeholder: 'Guinée, Chine, France...' },
            { key: 'norme', label: 'Norme / Certification', type: 'text', placeholder: 'ISO 9001, CE...' },
        ]
    },
];

/**
 * Retourne la configuration d'attributs pour une catégorie donnée
 * en recherchant les mots-clés dans le nom de la catégorie.
 * 
 * @param {string} categoryName - Le nom de la catégorie sélectionnée
 * @returns {object|null} - La config d'attributs ou null si aucune correspondance
 */
export function getAttributesForCategory(categoryName) {
    if (!categoryName) return null;
    const lower = categoryName.toLowerCase();
    
    for (const config of CATEGORY_ATTRIBUTES) {
        if (config.keywords.some(kw => lower.includes(kw))) {
            return config;
        }
    }
    
    return null;
}

/**
 * Couleurs par thème de catégorie pour l'affichage des attributs
 */
export const ATTRIBUTE_COLOR_MAP = {
    blue:   { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', label: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', label: 'text-purple-500', badge: 'bg-purple-100 text-purple-700' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', label: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
    green:  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', label: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    pink:   { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-600', label: 'text-pink-500', badge: 'bg-pink-100 text-pink-700' },
    amber:  { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', label: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
    red:    { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', label: 'text-red-500', badge: 'bg-red-100 text-red-700' },
    cyan:   { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-600', label: 'text-cyan-500', badge: 'bg-cyan-100 text-cyan-700' },
    stone:  { bg: 'bg-stone-50', border: 'border-stone-100', text: 'text-stone-600', label: 'text-stone-500', badge: 'bg-stone-100 text-stone-700' },
};
