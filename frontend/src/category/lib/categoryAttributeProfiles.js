/**
 * Source unique — profils d'attributs BCA Connect (38 catégories Alibaba-style)
 * Importé par frontend (Vite) et backend (Node).
 */

const select = (options) => ({ type: 'select', options });
const txt = (placeholder, unit) => ({ type: 'text', placeholder, ...(unit ? { unit } : {}) });
const num = (placeholder, unit) => ({ type: 'number', placeholder, ...(unit ? { unit } : {}) });
const yr = (placeholder) => ({ type: 'year', placeholder });

const GENERIC_PROFILE = {
    id: 'generique',
    keywords: [],
    label: 'Caractéristiques Générales',
    color: 'slate',
    fields: [
        { key: 'marque', label: 'Marque', ...txt('Marque ou fabricant...') },
        { key: 'modele', label: 'Modèle / Référence', ...txt('Référence produit...') },
        { key: 'couleur', label: 'Couleur', ...txt('Couleur principale...') },
        { key: 'dimensions', label: 'Dimensions', ...txt('L x l x H ou taille...') },
        { key: 'poids', label: 'Poids', ...txt('Poids net...', 'Kg') },
        { key: 'matiere', label: 'Matière / Composition', ...txt('Matière, composition...') },
        { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état', 'Occasion', 'Reconditionné']) },
        { key: 'garantie', label: 'Garantie', ...txt('12 mois, 24 mois...') },
        { key: 'origine', label: 'Origine / Provenance', ...txt('Guinée, Chine, Europe...') },
    ],
};

const CATEGORY_ATTRIBUTE_PROFILES = [
    {
        id: 'telephone',
        keywords: ['téléphone', 'telephone', 'smartphone', 'mobile', 'iphone', 'android', 'galaxy', 'redmi', 'xiaomi', 'huawei', 'oppo', 'vivo', 'pixel', 'nokia', 'infinix', 'tecno'],
        label: 'Caractéristiques du Téléphone',
        color: 'indigo',
        fields: [
            { key: 'marque', label: 'Marque', ...txt('Samsung, Apple, Xiaomi...') },
            { key: 'modele', label: 'Modèle', ...txt('Galaxy S24, iPhone 15 Pro...') },
            { key: 'memoire_interne', label: 'Mémoire Interne', ...txt('128 Go', 'Go') },
            { key: 'ram', label: 'RAM', ...txt('8 Go', 'Go') },
            { key: 'ecran', label: "Taille d'Écran", ...txt('6.7"', '"') },
            { key: 'batterie', label: 'Batterie', ...txt('5000 mAh', 'mAh') },
            { key: 'couleur', label: 'Couleur', ...txt('Midnight Black...') },
            { key: 'etat', label: 'État', ...select(['Neuf sous blister', 'Neuf sans emballage', 'Reconditionné A+', 'Occasion très bon état', 'Occasion bon état']) },
            { key: 'dual_sim', label: 'Double SIM', ...select(['Oui', 'Non']) },
            { key: 'reseau', label: 'Réseau', ...txt('5G, 4G LTE...') },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois...') },
        ],
    },
    {
        id: 'pieces_auto',
        keywords: ['pièces auto', 'pieces auto', 'pièce auto', 'piece auto', 'accessoire vehicule', 'accessoire véhicule', 'pneu', 'frein', 'embrayage', 'filtre huile', 'batterie auto', 'amortisseur', 'pare-chocs', 'rétroviseur'],
        label: 'Pièces & Accessoires Auto',
        color: 'blue',
        fields: [
            { key: 'marque', label: 'Marque', ...txt('Bosch, Valeo, Toyota OEM...') },
            { key: 'reference', label: 'Référence / OEM', ...txt('Numéro de pièce...') },
            { key: 'compatibilite', label: 'Compatibilité Véhicule', ...txt('Toyota Hilux 2018-2022...') },
            { key: 'type_piece', label: 'Type de Pièce', ...txt('Filtre, Plaquette, Pneu...') },
            { key: 'dimensions', label: 'Dimensions / Taille', ...txt('205/55 R16, etc.') },
            { key: 'matiere', label: 'Matière', ...txt('Acier, Caoutchouc, Composite...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Neuf compatible', 'Occasion', 'Reconditionné']) },
            { key: 'garantie', label: 'Garantie', ...txt('6 mois, 12 mois...') },
        ],
    },
    {
        id: 'outil_auto',
        keywords: ['outil auto', 'outils auto', 'cric', 'diag auto', 'diagnostic auto', 'fournitures auto', 'clé dynamométrique', 'compresseur auto'],
        label: 'Outils & Fournitures Auto',
        color: 'sky',
        fields: [
            { key: 'marque', label: 'Marque', ...txt('Facom, Bosch, Michelin...') },
            { key: 'type_outil', label: "Type d'Outil", ...txt('Cric, Clé, Scanner OBD...') },
            { key: 'compatibilite', label: 'Compatibilité', ...txt('Tous véhicules, 12V...') },
            { key: 'matiere', label: 'Matière', ...txt('Acier, Aluminium...') },
            { key: 'puissance', label: 'Puissance / Capacité', ...txt('2T, 1500W...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état', 'Occasion']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois...') },
        ],
    },
    {
        id: 'vehicule',
        keywords: ['véhicule', 'vehicle', 'voiture', 'automobile', 'transport', 'moto', 'motocycle', 'camion', 'bus', 'pickup', 'suv', 'berline', 'utilitaire', 'toyota', 'mercedes', 'renault', 'peugeot', 'hilux', 'véhicules et transport'],
        label: 'Caractéristiques du Véhicule',
        color: 'blue',
        fields: [
            { key: 'marque', label: 'Marque', ...txt('Toyota, Mercedes, Renault...') },
            { key: 'modele', label: 'Modèle', ...txt('Hilux, Sprinter, Clio...') },
            { key: 'annee', label: 'Année', ...yr('2020') },
            { key: 'kilometrage', label: 'Kilométrage', ...num('45000', 'km') },
            { key: 'motorisation', label: 'Motorisation', ...select(['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL']) },
            { key: 'boite_vitesse', label: 'Boîte de Vitesse', ...select(['Manuelle', 'Automatique', 'Semi-automatique']) },
            { key: 'couleur', label: 'Couleur', ...txt('Blanc, Gris Métallisé...') },
            { key: 'etat', label: 'État du Véhicule', ...select(['Neuf', 'Très bon état', 'Bon état', 'Correct', 'Pour pièces']) },
            { key: 'puissance', label: 'Puissance', ...txt('150 ch', 'ch') },
            { key: 'nb_places', label: 'Nombre de Places', ...num('5') },
        ],
    },
    {
        id: 'informatique',
        keywords: ['informatique', 'ordinateur', 'laptop', 'pc', 'ordinateurs', 'macbook', 'thinkpad', 'notebook', 'portable pc', 'tablette', 'ipad', 'ordinateur portable'],
        label: 'Caractéristiques Informatiques',
        color: 'purple',
        fields: [
            { key: 'marque', label: 'Marque', ...txt('HP, Dell, Lenovo, Apple...') },
            { key: 'modele', label: 'Modèle / Référence', ...txt('XPS 15, ThinkPad X1...') },
            { key: 'processeur', label: 'Processeur (CPU)', ...txt('Intel Core i7-12700H') },
            { key: 'ram', label: 'Mémoire RAM', ...txt('16 Go DDR4', 'Go') },
            { key: 'stockage', label: 'Stockage', ...txt('512 Go SSD NVMe') },
            { key: 'ecran', label: "Taille d'Écran", ...txt('15.6"', '"') },
            { key: 'gpu', label: 'Carte Graphique (GPU)', ...txt('NVIDIA RTX 3060') },
            { key: 'os', label: "Système d'Exploitation", ...txt('Windows 11, Ubuntu...') },
            { key: 'couleur', label: 'Couleur', ...txt('Argent, Noir...') },
            { key: 'etat', label: 'État', ...select(['Neuf sous blister', 'Neuf sans emballage', 'Reconditionnée', 'Occasion très bon état', 'Occasion bon état']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois, 24 mois...') },
        ],
    },
    {
        id: 'composants_electroniques',
        keywords: ['composants électroniques', 'composants electroniques', 'microchip', 'condensateur', 'résistance', 'resistance', 'transistor', 'circuit intégré', 'arduino', 'raspberry', 'capteur', 'module électronique'],
        label: 'Composants Électroniques',
        color: 'violet',
        fields: [
            { key: 'type_composant', label: 'Type de Composant', ...txt('MCU, Capteur, Module WiFi...') },
            { key: 'reference', label: 'Référence', ...txt('STM32F103, LM7805...') },
            { key: 'tension', label: 'Tension', ...txt('3.3V, 5V, 12V...') },
            { key: 'courant', label: 'Courant', ...txt('1A, 500mA...') },
            { key: 'marque', label: 'Marque', ...txt('Texas Instruments, STMicro...') },
            { key: 'packaging', label: 'Conditionnement', ...txt('DIP, SMD, Boîte de 10...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Neuf bulk', 'Occasion', 'Reconditionné']) },
        ],
    },
    {
        id: 'electronique',
        keywords: ['électronique', 'electronique', 'high-tech', 'hightech', 'gadget', 'électronique grand public', 'casque', 'écouteur', 'enceinte', 'camera', 'caméra', 'drone'],
        label: 'Électronique Grand Public',
        color: 'purple',
        fields: [
            { key: 'marque', label: 'Marque', ...txt('Sony, JBL, Canon...') },
            { key: 'modele', label: 'Modèle / Référence', ...txt('WH-1000XM5...') },
            { key: 'connectivite', label: 'Connectivité', ...txt('Bluetooth 5.0, USB-C, WiFi...') },
            { key: 'autonomie', label: 'Autonomie / Puissance', ...txt('30h, 100W...') },
            { key: 'couleur', label: 'Couleur', ...txt('Noir, Blanc...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Reconditionné', 'Occasion très bon état', 'Occasion bon état']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois...') },
        ],
    },
    {
        id: 'chaussures',
        keywords: ['chaussure', 'chaussures', 'basket', 'sneaker', 'sandale', 'botte', 'mocassin', 'escarpin', 'pointure', 'talons'],
        label: 'Caractéristiques Chaussures',
        color: 'orange',
        fields: [
            { key: 'pointure', label: 'Pointure', ...txt('39, 42, 44...') },
            { key: 'type_chaussure', label: 'Type', ...txt('Basket, Sandale, Botte...') },
            { key: 'couleur', label: 'Couleur', ...txt('Noir, Blanc, Rouge...') },
            { key: 'matiere', label: 'Matière', ...txt('Cuir, Toile, Synthétique...') },
            { key: 'genre', label: 'Genre', ...select(['Homme', 'Femme', 'Enfant', 'Mixte']) },
            { key: 'marque', label: 'Marque', ...txt('Nike, Adidas, Puma...') },
            { key: 'semelle', label: 'Type de Semelle', ...txt('Caoutchouc, EVA, Cuir...') },
            { key: 'etat', label: 'État', ...select(['Neuf avec boîte', 'Neuf sans boîte', 'Très bon état', 'Bon état']) },
        ],
    },
    {
        id: 'vetement',
        keywords: ['vêtement', 'vetement', 'mode', 'textile', 'habit', 'tenue', 'chemise', 'pantalon', 'robe', 'jupe', 'blouson', 'manteau', 't-shirt', 'tshirt', 'polo', 'jean', 'costume', 'vêtements & accessoires', 'tenues de sport'],
        label: 'Caractéristiques du Vêtement',
        color: 'pink',
        fields: [
            { key: 'taille', label: 'Taille', ...txt('S, M, L, XL, 42, 44...') },
            { key: 'couleur', label: 'Couleur', ...txt('Bleu marine, Rouge bordeaux...') },
            { key: 'matiere', label: 'Matière / Composition', ...txt('100% Coton, Polyester...') },
            { key: 'genre', label: 'Genre', ...select(['Homme', 'Femme', 'Enfant', 'Mixte / Unisexe']) },
            { key: 'marque', label: 'Marque', ...txt('Nike, Zara, Sans marque...') },
            { key: 'etat', label: 'État', ...select(['Neuf avec étiquette', 'Neuf sans étiquette', 'Très bon état', 'Bon état', 'Acceptable']) },
            { key: 'entretien', label: 'Entretien', ...txt('Lavage main, 30°C maxi...') },
        ],
    },
    {
        id: 'bijoux',
        keywords: ['bijou', 'bijoux', 'montre', 'montres', 'lunette', 'lunettes', 'collier', 'bracelet', 'bague', 'boucle', 'or', 'argent', 'joaillerie'],
        label: 'Bijoux, Lunettes & Montres',
        color: 'amber',
        fields: [
            { key: 'type_bijou', label: 'Type', ...txt('Montre, Collier, Bague, Lunettes...') },
            { key: 'matiere', label: 'Matière', ...txt('Or 18K, Argent 925, Acier, Plaqué or...') },
            { key: 'pierre', label: 'Pierre / Détails', ...txt('Diamant, Zircon, Sans pierre...') },
            { key: 'poids', label: 'Poids', ...txt('5g, 25g...', 'g') },
            { key: 'couleur', label: 'Couleur / Finition', ...txt('Or jaune, Argenté, Noir...') },
            { key: 'genre', label: 'Genre', ...select(['Homme', 'Femme', 'Enfant', 'Mixte']) },
            { key: 'marque', label: 'Marque', ...txt('Rolex, Casio, Ray-Ban...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état', 'Vintage']) },
            { key: 'garantie', label: 'Garantie', ...txt('2 ans, 12 mois...') },
        ],
    },
    {
        id: 'beaute',
        keywords: ['beauté', 'beaute', 'cosmétique', 'cosmetique', 'maquillage', 'parfum', 'crème', 'creme', 'soin', 'produits de beauté', 'skincare', 'makeup'],
        label: 'Produits de Beauté',
        color: 'rose',
        fields: [
            { key: 'type_produit', label: 'Type de Produit', ...txt('Crème, Parfum, Rouge à lèvres...') },
            { key: 'marque', label: 'Marque', ...txt("L'Oréal, Nivea, MAC...") },
            { key: 'contenance', label: 'Contenance / Volume', ...txt('50ml, 250ml...') },
            { key: 'type_peau', label: 'Type de Peau / Usage', ...txt('Peau sèche, Mixte, Tous types...') },
            { key: 'parfum', label: 'Parfum / Fragrance', ...txt('Floral, Boisé, Sans parfum...') },
            { key: 'bio', label: 'Bio / Naturel', ...select(['Oui', 'Non', 'Partiellement']) },
            { key: 'dlc', label: 'Date de Péremption', ...txt('06/2027') },
            { key: 'etat', label: 'État', ...select(['Neuf scellé', 'Neuf', 'Testé']) },
        ],
    },
    {
        id: 'meubles',
        keywords: ['meuble', 'meubles', 'canapé', 'canape', 'lit', 'armoire', 'table', 'chaise', 'bureau meuble', 'etagère', 'étagère', 'commode'],
        label: 'Caractéristiques Meubles',
        color: 'amber',
        fields: [
            { key: 'type_meuble', label: 'Type de Meuble', ...txt('Canapé, Lit, Armoire, Table...') },
            { key: 'matiere', label: 'Matière', ...txt('Bois massif, MDF, Métal, Tissu...') },
            { key: 'dimensions', label: 'Dimensions (L x P x H)', ...txt('200 x 90 x 85 cm') },
            { key: 'couleur', label: 'Couleur / Finition', ...txt('Chêne, Blanc, Gris anthracite...') },
            { key: 'style', label: 'Style', ...txt('Moderne, Classique, Scandinave...') },
            { key: 'montage', label: 'Montage', ...select(['Monté', 'À monter (IKEA)', 'Semi-monté']) },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état', 'Occasion']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois, 24 mois...') },
        ],
    },
    {
        id: 'maison_jardin',
        keywords: ['maison', 'jardin', 'décoration', 'decoration', 'déco', 'deco', 'jardinage', 'plante', 'poterie', 'ustensile', 'maison & jardin', 'cuisine maison'],
        label: 'Maison & Jardin',
        color: 'green',
        fields: [
            { key: 'type_produit', label: 'Type de Produit', ...txt('Décoration, Ustensile, Plante...') },
            { key: 'matiere', label: 'Matière', ...txt('Céramique, Inox, Plastique, Bois...') },
            { key: 'dimensions', label: 'Dimensions', ...txt('30 cm, 5 L...') },
            { key: 'couleur', label: 'Couleur', ...txt('Blanc, Vert, Multicolore...') },
            { key: 'usage', label: 'Usage', ...txt('Intérieur, Extérieur, Cuisine...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état']) },
        ],
    },
    {
        id: 'eclairage',
        keywords: ['lumière', 'lumiere', 'éclairage', 'eclairage', 'lampe', 'ampoule', 'led', 'luminaire', 'projecteur', 'néon'],
        label: 'Lumière & Éclairage',
        color: 'yellow',
        fields: [
            { key: 'type_luminaire', label: 'Type', ...txt('Plafonnier, Lampe de bureau, Ruban LED...') },
            { key: 'puissance', label: 'Puissance', ...txt('12W, 60W équivalent...', 'W') },
            { key: 'temperature_couleur', label: 'Température de Couleur', ...txt('3000K blanc chaud, 6500K froid...') },
            { key: 'indice_ip', label: 'Indice IP', ...txt('IP20, IP65 étanche...') },
            { key: 'ampoule_incluse', label: 'Ampoule Incluse', ...select(['Oui', 'Non']) },
            { key: 'couleur', label: 'Couleur / Finition', ...txt('Blanc, Noir, Chrome...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Occasion']) },
            { key: 'garantie', label: 'Garantie', ...txt('2 ans, 5 ans...') },
        ],
    },
    {
        id: 'sport_loisirs',
        keywords: ['sport', 'loisir', 'loisirs', 'fitness', 'musculation', 'vélo', 'velo', 'ballon', 'camping', 'randonnée', 'randonnee', 'sports & loisirs'],
        label: 'Sports & Loisirs',
        color: 'lime',
        fields: [
            { key: 'type_sport', label: 'Type / Sport', ...txt('Football, Fitness, Vélo, Camping...') },
            { key: 'taille', label: 'Taille / Dimension', ...txt('Taille 5, M, 26"...') },
            { key: 'couleur', label: 'Couleur', ...txt('Rouge, Bleu, Noir...') },
            { key: 'marque', label: 'Marque', ...txt('Adidas, Decathlon, Nike...') },
            { key: 'matiere', label: 'Matière', ...txt('Polyester, Caoutchouc, Aluminium...') },
            { key: 'niveau', label: 'Niveau', ...select(['Débutant', 'Intermédiaire', 'Professionnel', 'Tous niveaux']) },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état', 'Occasion']) },
        ],
    },
    {
        id: 'bagages',
        keywords: ['bagage', 'bagages', 'sac', 'sacs', 'valise', 'étui', 'etui', 'sac à dos', 'sac a dos', 'cartable', 'mallette'],
        label: 'Bagages, Sacs & Étuis',
        color: 'teal',
        fields: [
            { key: 'type_sac', label: 'Type', ...txt('Valise, Sac à dos, Sacoche, Étui...') },
            { key: 'capacite', label: 'Capacité / Volume', ...txt('40L, 20 pouces, 15"...') },
            { key: 'dimensions', label: 'Dimensions', ...txt('55 x 40 x 23 cm') },
            { key: 'matiere', label: 'Matière', ...txt('Polycarbonate, Nylon, Cuir...') },
            { key: 'couleur', label: 'Couleur', ...txt('Noir, Gris, Rouge...') },
            { key: 'marque', label: 'Marque', ...txt('Samsonite, American Tourister...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état']) },
        ],
    },
    {
        id: 'jouets',
        keywords: ['jouet', 'jouets', 'enfant', 'enfants', 'bébé', 'bebe', 'parents', 'peluche', 'puzzle', 'lego', 'poupée', 'poupee'],
        label: 'Parents, Enfants & Jouets',
        color: 'fuchsia',
        fields: [
            { key: 'age_recommande', label: 'Âge Recommandé', ...txt('3+, 6-12 ans, 0-3 ans...') },
            { key: 'type_jouet', label: 'Type de Jouet', ...txt('Peluche, Puzzle, Véhicule, Éducatif...') },
            { key: 'marque', label: 'Marque', ...txt('Lego, Mattel, Fisher-Price...') },
            { key: 'materiau', label: 'Matériau', ...txt('Plastique ABS, Bois, Tissu...') },
            { key: 'norme_securite', label: 'Norme Sécurité', ...txt('CE, EN71, Non toxique...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état']) },
        ],
    },
    {
        id: 'hygiene',
        keywords: ['hygiène', 'hygiene', 'ménage', 'menage', 'nettoyant', 'détergent', 'detergent', 'savon', 'shampoing', 'shampooing', 'lessive', 'hygiène perso'],
        label: 'Hygiène Perso & Ménage',
        color: 'cyan',
        fields: [
            { key: 'type_produit', label: 'Type de Produit', ...txt('Lessive, Savon, Désinfectant...') },
            { key: 'marque', label: 'Marque', ...txt('Omo, Ajax, Dove...') },
            { key: 'contenance', label: 'Contenance', ...txt('1L, 500ml, 2Kg...') },
            { key: 'parfum', label: 'Parfum', ...txt('Fraîcheur, Citron, Sans parfum...') },
            { key: 'bio', label: 'Bio / Écologique', ...select(['Oui', 'Non']) },
            { key: 'etat', label: 'État', ...select(['Neuf scellé', 'Neuf']) },
        ],
    },
    {
        id: 'sante',
        keywords: ['médical', 'medical', 'santé', 'sante', 'médicament', 'medicament', 'pharmacie', 'parapharmacie', 'médical & santé', 'dispositif médical'],
        label: 'Médical & Santé',
        color: 'red',
        fields: [
            { key: 'type_produit', label: 'Type de Produit', ...txt('Médicament, Dispositif, Complément...') },
            { key: 'contenance', label: 'Contenance / Dosage', ...txt('250ml, 500mg...') },
            { key: 'composition', label: 'Composition / Principes actifs', ...txt('Paracétamol 500mg...') },
            { key: 'dlc', label: 'Date de Péremption', ...txt('06/2027') },
            { key: 'ordonnance', label: 'Ordonnance Requise', ...select(['Non', 'Oui']) },
            { key: 'fabricant', label: 'Fabricant / Laboratoire', ...txt('Sanofi, Pfizer...') },
            { key: 'pays_origine', label: "Pays d'Origine", ...txt('France, Inde...') },
        ],
    },
    {
        id: 'animalerie',
        keywords: ['animalerie', 'animal', 'animaux', 'chien', 'chat', 'oiseau', 'poisson aquarium', 'croquette', 'litière', 'litiere', 'aquarium'],
        label: 'Animalerie',
        color: 'lime',
        fields: [
            { key: 'espece', label: 'Espèce / Animal', ...txt('Chien, Chat, Oiseau, Poisson...') },
            { key: 'type_produit', label: 'Type de Produit', ...txt('Croquettes, Litière, Cage, Jouet...') },
            { key: 'poids_volume', label: 'Poids / Volume', ...txt('15 Kg, 5 L...') },
            { key: 'age_animal', label: "Âge de l'Animal", ...txt('Chiot, Adulte, Senior...') },
            { key: 'marque', label: 'Marque', ...txt('Royal Canin, Whiskas...') },
            { key: 'composition', label: 'Composition', ...txt('Poulet 30%, Céréales...') },
        ],
    },
    {
        id: 'bureau',
        keywords: ['bureau', 'fournitures de bureau', 'papeterie', 'stylo', 'cahier', 'classeur', 'imprimante bureau', 'encre', 'cartouche'],
        label: 'Fournitures de Bureau',
        color: 'slate',
        fields: [
            { key: 'type_fourniture', label: 'Type', ...txt('Stylo, Cahier, Classeur, Encre...') },
            { key: 'format', label: 'Format', ...txt('A4, A5, 100 pages...') },
            { key: 'couleur', label: 'Couleur', ...txt('Bleu, Noir, Assortiment...') },
            { key: 'quantite', label: 'Quantité / Pack', ...txt('Paquet de 10, Ramette 500 feuilles...') },
            { key: 'marque', label: 'Marque', ...txt('Bic, Clairefontaine, HP...') },
        ],
    },
    {
        id: 'cadeaux_artisanat',
        keywords: ['cadeau', 'cadeaux', 'artisanat', 'artisanal', 'fait main', 'handmade', 'souvenir', 'sculpture', 'poterie artisanale'],
        label: 'Cadeaux & Artisanat',
        color: 'rose',
        fields: [
            { key: 'type_article', label: "Type d'Article", ...txt('Sculpture, Poterie, Bijou artisanal...') },
            { key: 'matiere', label: 'Matière', ...txt('Bois, Argile, Wax print...') },
            { key: 'origine', label: 'Origine / Région', ...txt('Guinée, Mali, Local...') },
            { key: 'fait_main', label: 'Fait Main', ...select(['Oui', 'Non', 'Partiellement']) },
            { key: 'dimensions', label: 'Dimensions', ...txt('20 cm, 30 x 15 cm...') },
            { key: 'occasion', label: 'Occasion', ...txt('Mariage, Naissance, Décor...') },
        ],
    },
    {
        id: 'alimentation',
        keywords: ['agriculture', 'aliment', 'boisson', 'fruits', 'légumes', 'legumes', 'épicerie', 'vivrier', 'mangue', 'riz', 'poisson', 'viande', 'céréale', 'alimentation', 'agriculture, aliments'],
        label: 'Alimentation & Agriculture',
        color: 'green',
        fields: [
            { key: 'variete', label: 'Variété / Type', ...txt('Mangue Kent, Riz Basmati...') },
            { key: 'poids_net', label: 'Poids Net', ...txt('5 Kg, 500g...', 'Kg') },
            { key: 'conditionnement', label: 'Conditionnement', ...txt('Sac, Filet, Caisse, Vrac...') },
            { key: 'origine', label: 'Origine / Provenance', ...txt("Guinée, Côte d'Ivoire...") },
            { key: 'bio', label: 'Agriculture Biologique', ...select(['Oui', 'Non', 'En cours de certification']) },
            { key: 'date_recolte', label: 'Date de Récolte / Production', ...txt('Juin 2025') },
            { key: 'dlc', label: 'Date Limite de Consommation', ...txt('31/12/2025') },
            { key: 'conservation', label: 'Conditions de Conservation', ...txt('Lieu frais et sec, Réfrigéré...') },
        ],
    },
    {
        id: 'immobilier',
        keywords: ['immobilier', 'terrain', 'appartement', 'villa', 'logement', 'colocation', 'studio', 'construction & immobilier', 'local commercial immobilier'],
        label: 'Construction & Immobilier',
        color: 'amber',
        fields: [
            { key: 'type_bien', label: 'Type de Bien', ...select(['Maison', 'Villa', 'Appartement', 'Studio', 'Terrain', 'Bureau', 'Local commercial', 'Entrepôt']) },
            { key: 'type_offre', label: "Type d'Offre", ...select(['À Vendre', 'À Louer', 'Colocation']) },
            { key: 'surface', label: 'Surface', ...num('120', 'm²') },
            { key: 'nb_pieces', label: 'Nombre de Pièces', ...num('4') },
            { key: 'nb_chambres', label: 'Nombre de Chambres', ...num('3') },
            { key: 'quartier', label: 'Quartier / Zone', ...txt('Kaloum, Ratoma...') },
            { key: 'meuble', label: 'Meublé', ...select(['Oui', 'Non', 'Partiellement']) },
            { key: 'etat', label: 'État du Bien', ...select(['Neuf', 'Bon état', 'À rénover', 'En construction']) },
        ],
    },
    {
        id: 'machine_construction',
        keywords: ['machine bâtiment', 'machine batiment', 'machine construction', 'engin', 'excavateur', 'bulldozer', 'bétonnière', 'betonniere', 'grue', 'compacteur', 'niveleuse', 'machines pour le bâtiment'],
        label: 'Machines Bâtiment & Construction',
        color: 'stone',
        fields: [
            { key: 'type_engin', label: "Type d'Engin", ...txt('Excavateur, Bulldozer, Grue...') },
            { key: 'marque', label: 'Marque', ...txt('Caterpillar, Komatsu, JCB...') },
            { key: 'modele', label: 'Modèle', ...txt('320D, PC200...') },
            { key: 'annee', label: 'Année', ...yr('2018') },
            { key: 'heures_utilisation', label: "Heures d'Utilisation", ...num('3500', 'h') },
            { key: 'poids_operationnel', label: 'Poids Opérationnel', ...txt('20 tonnes...', 'T') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état', 'À réviser']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois...') },
        ],
    },
    {
        id: 'machine_industrielle',
        keywords: ['machine industrielle', 'machines industrielles', 'industrie', 'presse', 'fraiseuse', 'tour cnc', 'injecteur', 'ligne production', 'usine'],
        label: 'Machines Industrielles',
        color: 'stone',
        fields: [
            { key: 'type_machine', label: 'Type de Machine', ...txt('Presse, CNC, Convoyeur...') },
            { key: 'marque', label: 'Marque', ...txt('Siemens, Haas, DMG...') },
            { key: 'modele', label: 'Modèle', ...txt('Référence machine...') },
            { key: 'puissance', label: 'Puissance', ...txt('15 kW, 50 CV...') },
            { key: 'capacite', label: 'Capacité / Débit', ...txt('500 pièces/h, 10T...') },
            { key: 'annee', label: 'Année', ...yr('2020') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Reconditionné', 'Occasion bon état', 'Occasion']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois, 24 mois...') },
        ],
    },
    {
        id: 'machine_commerciale',
        keywords: ['machine commerciale', 'équipement commercial', 'equipement commercial', 'machines commerciaux', 'froid commercial', 'four boulangerie', 'machine café pro', 'caisse enregistreuse'],
        label: 'Équipements & Machines Commerciaux',
        color: 'orange',
        fields: [
            { key: 'type_equipement', label: "Type d'Équipement", ...txt('Four pro, Vitrine réfrigérée, Machine à café...') },
            { key: 'marque', label: 'Marque', ...txt('Rational, La Marzocco...') },
            { key: 'capacite', label: 'Capacité', ...txt('10 niveaux, 200L...') },
            { key: 'alimentation', label: 'Alimentation', ...txt('220V, 380V triphasé...') },
            { key: 'dimensions', label: 'Dimensions', ...txt('120 x 80 x 180 cm') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Reconditionné', 'Occasion']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois...') },
        ],
    },
    {
        id: 'manutention',
        keywords: ['manutention', 'chariot élévateur', 'chariot elevateur', 'transpalette', 'gerbeur', 'convoyeur', 'palans', 'grue mobile', 'forklift'],
        label: 'Manutention',
        color: 'teal',
        fields: [
            { key: 'type_equipement', label: "Type d'Équipement", ...txt('Chariot élévateur, Transpalette, Gerbeur...') },
            { key: 'marque', label: 'Marque', ...txt('Toyota, Jungheinrich, Hyster...') },
            { key: 'capacite_charge', label: 'Capacité de Charge', ...txt('2.5T, 1500 Kg...', 'Kg') },
            { key: 'hauteur_levage', label: 'Hauteur de Levage', ...txt('3m, 6m...', 'm') },
            { key: 'motorisation', label: 'Motorisation', ...select(['Électrique', 'Diesel', 'GPL', 'Manuel']) },
            { key: 'annee', label: 'Année', ...yr('2019') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Très bon état', 'Bon état', 'Occasion']) },
        ],
    },
    {
        id: 'instrument_test',
        keywords: ['instrument test', 'équipement de test', 'equipement de test', 'multimètre', 'multimetre', 'oscilloscope', 'mesure', 'étalonnage', 'etalonnage', 'instrument & équipement'],
        label: 'Instruments & Équipements de Test',
        color: 'violet',
        fields: [
            { key: 'type_instrument', label: "Type d'Instrument", ...txt('Multimètre, Oscilloscope, Analyseur...') },
            { key: 'marque', label: 'Marque', ...txt('Fluke, Keysight, Rigol...') },
            { key: 'precision', label: 'Précision', ...txt('0.01%, Classe 1...') },
            { key: 'plage_mesure', label: 'Plage de Mesure', ...txt('0-600V, 0-100MHz...') },
            { key: 'etalonnage', label: 'Étalonnage', ...select(['Étalonné', 'Non étalonné', 'Certificat inclus']) },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Occasion', 'Reconditionné']) },
        ],
    },
    {
        id: 'equipement_electrique',
        keywords: ['équipement électrique', 'equipement electrique', 'fourniture électrique', 'disjoncteur', 'câble électrique', 'tableau électrique', 'transformateur', 'contacteur'],
        label: 'Équipements & Fournitures Électriques',
        color: 'yellow',
        fields: [
            { key: 'type_equipement', label: 'Type', ...txt('Disjoncteur, Câble, Tableau, Transformateur...') },
            { key: 'tension', label: 'Tension', ...txt('220V, 380V, BT/HT...') },
            { key: 'puissance', label: 'Puissance / Calibre', ...txt('63A, 100 kVA...') },
            { key: 'norme', label: 'Norme', ...txt('IEC, NF C 15-100, CE...') },
            { key: 'marque', label: 'Marque', ...txt('Schneider, Legrand, ABB...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Occasion']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois, 24 mois...') },
        ],
    },
    {
        id: 'securite',
        keywords: ['sûreté', 'surete', 'sécurité', 'securite', 'alarme', 'caméra surveillance', 'camera surveillance', 'extincteur', 'gilet sécurité', 'epi', 'détecteur'],
        label: 'Sûreté & Sécurité',
        color: 'red',
        fields: [
            { key: 'type_equipement', label: "Type d'Équipement", ...txt('Alarme, Caméra IP, Extincteur, EPI...') },
            { key: 'norme', label: 'Norme / Certification', ...txt('CE, NF, ISO 45001...') },
            { key: 'portee', label: 'Portée / Couverture', ...txt('100m², 8 caméras, 6Kg CO2...') },
            { key: 'alimentation', label: 'Alimentation', ...txt('220V, Batterie, Solaire...') },
            { key: 'marque', label: 'Marque', ...txt('Hikvision, Bosch Security...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Occasion']) },
            { key: 'garantie', label: 'Garantie', ...txt('12 mois, 24 mois...') },
        ],
    },
    {
        id: 'transmission_energie',
        keywords: ['transmission', "transmission d'énergie", 'transmission energie', 'courroie', 'poulie', 'engrenage', 'réducteur', 'reducteur', 'accouplement', 'roulement'],
        label: "Transmission d'Énergie",
        color: 'sky',
        fields: [
            { key: 'type_composant', label: 'Type de Composant', ...txt('Courroie, Réducteur, Roulement...') },
            { key: 'reference', label: 'Référence', ...txt('SKF 6205, Réducteur 1:50...') },
            { key: 'puissance_nominale', label: 'Puissance Nominale', ...txt('5 kW, 10 CV...') },
            { key: 'vitesse', label: 'Vitesse / RPM', ...txt('1450 tr/min, 1:30...') },
            { key: 'marque', label: 'Marque', ...txt('SKF, Gates, SEW...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Occasion', 'Reconditionné']) },
        ],
    },
    {
        id: 'energie_renouvelable',
        keywords: ['énergie renouvelable', 'energie renouvelable', 'solaire', 'panneau solaire', 'onduleur', 'photovoltaïque', 'photovoltaique', 'éolien', 'batterie lithium'],
        label: 'Énergies Renouvelables',
        color: 'lime',
        fields: [
            { key: 'type_equipement', label: 'Type', ...txt('Panneau solaire, Onduleur, Batterie...') },
            { key: 'puissance', label: 'Puissance', ...txt('550W, 5kW, 10kWh...') },
            { key: 'rendement', label: 'Rendement', ...txt('21%, 95% onduleur...') },
            { key: 'marque', label: 'Marque', ...txt('Jinko, Huawei, Victron...') },
            { key: 'garantie', label: 'Garantie', ...txt('25 ans panneau, 10 ans onduleur...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Occasion']) },
        ],
    },
    {
        id: 'electromenager',
        keywords: ['électroménager', 'electromenager', 'réfrigérateur', 'refrigerateur', 'climatiseur', 'lave-linge', 'four', 'machine à laver', 'congélateur', 'micro-ondes'],
        label: 'Électroménager',
        color: 'cyan',
        fields: [
            { key: 'marque', label: 'Marque', ...txt('Samsung, LG, Whirlpool...') },
            { key: 'modele', label: 'Modèle / Référence', ...txt('WW90T534DAE...') },
            { key: 'capacite', label: 'Capacité / Taille', ...txt('9 Kg, 300 L, 55"...') },
            { key: 'puissance', label: 'Puissance', ...txt('2200W, 1.5 CV...') },
            { key: 'couleur', label: 'Couleur / Finition', ...txt('Blanc, Inox...') },
            { key: 'classe_energie', label: 'Classe Énergetique', ...select(['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'Non renseigné']) },
            { key: 'etat', label: 'État', ...select(['Neuf sous blister', 'Neuf sans emballage', 'Reconditionné', 'Occasion très bon état', 'Occasion bon état']) },
            { key: 'garantie', label: 'Garantie', ...txt('24 mois, 12 mois...') },
        ],
    },
    {
        id: 'bricolage',
        keywords: ['bricolage', 'quincaillerie', 'outil bricolage', 'marteau', 'scie', 'vis', 'boulon', 'colle', 'peinture mur'],
        label: 'Bricolage & Quincaillerie',
        color: 'stone',
        fields: [
            { key: 'type_produit', label: 'Type de Produit', ...txt('Vis, Peinture, Outil main...') },
            { key: 'matiere', label: 'Matière', ...txt('Acier inox, Laiton, Acrylique...') },
            { key: 'dimensions', label: 'Dimensions / Filetage', ...txt('M8 x 50mm, 2.5L...') },
            { key: 'usage', label: 'Usage', ...txt('Intérieur, Extérieur, Bois, Métal...') },
            { key: 'marque', label: 'Marque', ...txt('Stanley, Bosch, Sika...') },
            { key: 'norme', label: 'Norme', ...txt('DIN, ISO, CE...') },
            { key: 'etat', label: 'État', ...select(['Neuf', 'Occasion']) },
        ],
    },
    {
        id: 'materiau',
        keywords: ['matière première', 'matiere premiere', 'matériaux', 'materiaux', 'bois brut', 'métal brut', 'ciment', 'sable', 'gravier', 'matières premières'],
        label: 'Matières Premières',
        color: 'stone',
        fields: [
            { key: 'matiere', label: 'Matière / Composition', ...txt('Acier galvanisé, Bois teck...') },
            { key: 'dimensions', label: 'Dimensions', ...txt('50x100x200 cm, 3m x 6m...') },
            { key: 'poids', label: 'Poids / Tonnage', ...txt('25 Kg, 1 Tonne...', 'Kg') },
            { key: 'quantite_min', label: 'Quantité Minimum de Commande', ...num('100') },
            { key: 'origine', label: "Pays / Région d'Origine", ...txt('Guinée, Chine, France...') },
            { key: 'norme', label: 'Norme / Certification', ...txt('ISO 9001, CE...') },
        ],
    },
    {
        id: 'emballage',
        keywords: ['emballage', 'impression', 'carton', 'boîte', 'boite', 'sac plastique', 'étiquette', 'etiquette', 'packaging', 'film plastique'],
        label: 'Emballage & Impression',
        color: 'teal',
        fields: [
            { key: 'type_emballage', label: "Type d'Emballage", ...txt('Carton, Sachet, Bouteille, Étiquette...') },
            { key: 'dimensions', label: 'Dimensions', ...txt('30 x 20 x 15 cm, A4...') },
            { key: 'materiau', label: 'Matériau', ...txt('Carton ondulé, PET, Kraft...') },
            { key: 'capacite', label: 'Capacité', ...txt('500ml, 5 Kg, 100 unités...') },
            { key: 'impression_perso', label: 'Impression Personnalisée', ...select(['Oui', 'Non', 'Sur devis']) },
            { key: 'quantite_min', label: 'Quantité Minimum', ...num('1000') },
        ],
    },
    {
        id: 'service',
        keywords: ['service', 'services de fabrication', 'prestation', 'consulting', 'maintenance', 'installation', 'réparation', 'reparation', 'location service'],
        label: 'Services & Prestations',
        color: 'slate',
        fields: [
            { key: 'type_service', label: 'Type de Service', ...txt('Installation, Maintenance, Conseil, Fabrication...') },
            { key: 'duree', label: 'Durée / Délai', ...txt('2h, 3 jours, 1 semaine...') },
            { key: 'zone', label: "Zone d'Intervention", ...txt('Conakry, Toute la Guinée...') },
            { key: 'delai', label: 'Délai de Réalisation', ...txt('24h, 48h, Sur RDV...') },
            { key: 'certification', label: 'Certification / Qualification', ...txt('ISO, Agrément, Expérience 10 ans...') },
            { key: 'modalite', label: 'Modalité', ...select(['Sur site', 'À distance', 'Sur site ou distance', 'Sur devis']) },
        ],
    },
];

const ALL_PROFILE_IDS = CATEGORY_ATTRIBUTE_PROFILES.map((p) => p.id);

function getAttributesForCategory(categoryName = '', productName = '') {
    const catLower = (categoryName || '').toLowerCase();
    const prodLower = (productName || '').toLowerCase();
    const text = `${catLower} ${prodLower}`.trim();

    if (!text) return null;

    let best = null;
    let bestScore = 0;

    for (const config of CATEGORY_ATTRIBUTE_PROFILES) {
        let score = 0;
        for (const kw of config.keywords) {
            if (prodLower.includes(kw)) score += 4;
            if (catLower.includes(kw)) score += 2;
        }
        if (score > bestScore) {
            bestScore = score;
            best = config;
        }
    }

    if (bestScore > 0) return best;
    if (categoryName || productName) return GENERIC_PROFILE;
    return null;
}

function filterAttributsForProfile(attributs = {}, profile) {
    if (!profile?.fields) return {};
    const allowed = new Set(profile.fields.map((f) => f.key));
    return Object.fromEntries(
        Object.entries(attributs || {}).filter(([k, v]) => allowed.has(k) && v != null && v !== '')
    );
}

function mapAiResponseToAttributs(profile, aiData = {}) {
    if (!profile?.fields) return {};

    const result = {};
    const labelToKey = Object.fromEntries(profile.fields.map((f) => [f.label.toLowerCase(), f.key]));
    const keySet = new Set(profile.fields.map((f) => f.key));

    if (aiData.attributs && typeof aiData.attributs === 'object') {
        for (const [k, v] of Object.entries(aiData.attributs)) {
            const key = keySet.has(k) ? k : labelToKey[k.toLowerCase()];
            if (key && v != null && v !== '') result[key] = String(v);
        }
    }

    if (Array.isArray(aiData.caracteristiques)) {
        for (const item of aiData.caracteristiques) {
            const nom = (item.nom || item.name || '').toLowerCase().trim();
            const valeur = item.valeur ?? item.value;
            if (!nom || valeur == null || valeur === '') continue;

            const byLabel = labelToKey[nom];
            const byKey = keySet.has(nom.replace(/\s+/g, '_')) ? nom.replace(/\s+/g, '_') : null;
            const fuzzy = profile.fields.find((f) =>
                nom.includes(f.label.toLowerCase()) || f.label.toLowerCase().includes(nom)
            )?.key;

            const key = byLabel || byKey || fuzzy;
            if (key) result[key] = String(valeur);
        }
    }

    return result;
}

function buildAttributePromptBlock(profile) {
    if (!profile) return '';
    return profile.fields
        .map((f) => `  "${f.key}": "valeur réaliste pour ${f.label}"`)
        .join(',\n');
}

export {
    GENERIC_PROFILE,
    CATEGORY_ATTRIBUTE_PROFILES,
    ALL_PROFILE_IDS,
    getAttributesForCategory,
    filterAttributsForProfile,
    mapAiResponseToAttributs,
    buildAttributePromptBlock,
};
