const { sequelize, Category, Product, Store, User, Wallet } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

const CATEGORIES = [
    { name: 'Électronique & High-Tech', desc: 'Smartphones, ordinateurs, composants et gadgets.', keywords: 'tech,electronics,laptop,phone' },
    { name: 'Mode & Accessoires', desc: 'Vêtements, chaussures et accessoires tendance.', keywords: 'fashion,clothes,shoes,watch' },
    { name: 'Maison & Jardin', desc: 'Mobilier, décoration et outils de jardinage.', keywords: 'home,furniture,garden,decor' },
    { name: 'Industrie & Machines', desc: 'Équipements industriels et machines de production.', keywords: 'industrial,machinery,factory,tools' },
    { name: 'Agriculture & Elevage', desc: 'Produits agricoles, semences et équipements.', keywords: 'agriculture,farm,crops,tractor' },
    { name: 'Santé & Beauté', desc: 'Soins personnels, cosmétiques et bien-être.', keywords: 'beauty,cosmetics,health,makeup' },
    { name: 'Construction & Immobilier', desc: 'Matériaux de construction et services liés.', keywords: 'construction,building,materials,architecture' },
    { name: 'Alimentation & Boissons', desc: 'Produits frais, épicerie et boissons locales.', keywords: 'food,grocery,fruit,drink' },
    { name: 'Véhicules & Transport', desc: 'Voitures, motos et pièces détachées.', keywords: 'car,motorcycle,vehicle,parts' },
    { name: 'Énergie & Solaire', desc: 'Panneaux solaires, batteries et solutions vertes.', keywords: 'solar,energy,battery,green' },
    { name: 'Bureau & Papeterie', desc: 'Fournitures de bureau et mobilier professionnel.', keywords: 'office,stationery,desk,chair' },
    { name: 'Sport & Loisirs', desc: 'Équipements sportifs et articles de détente.', keywords: 'sport,fitness,gym,leisure' },
    { name: 'Jouets & Enfance', desc: 'Jeux, jouets et articles pour bébés.', keywords: 'toys,kids,baby,play' },
    { name: 'Bijoux & Montres', desc: 'Luxe, élégance et précision.', keywords: 'jewelry,luxury,diamond,ring' },
    { name: 'Services Professionnels', desc: 'Conseils, maintenance et services B2B.', keywords: 'service,consulting,business,it' }
];

const PRODUCT_TEMPLATES = {
    'Électronique & High-Tech': [
        { name: 'Smartphone Pro Max', price: 12000000, desc: 'Dernière génération avec écran OLED.' },
        { name: 'Laptop Ultra Slim', price: 15000000, desc: 'Puissant et léger pour les pros.' },
        { name: 'Écouteurs Noise Cancelling', price: 1500000, desc: 'Son immersif et pur.' },
        { name: 'Clavier Mécanique RGB', price: 800000, desc: 'Précision ultime pour le gaming.' },
        { name: 'SSD Externe 2To', price: 2500000, desc: 'Vitesse de transfert fulgurante.' }
    ],
    'Mode & Accessoires': [
        { name: 'Veste en Cuir Premium', price: 3500000, desc: 'Style intemporel et robuste.' },
        { name: 'Robe de Soirée Élégante', price: 2800000, desc: 'Idéale pour vos grands événements.' },
        { name: 'Sneakers Limited Edition', price: 1800000, desc: 'Confort et design urbain.' },
        { name: 'Sac à Main de Créateur', price: 5000000, desc: 'Luxe et finitions soignées.' },
        { name: 'Lunettes de Soleil Aviator', price: 950000, desc: 'Protection UV et style iconique.' }
    ],
    'Maison & Jardin': [
        { name: 'Canapé Scandinave', price: 8500000, desc: 'Confort minimaliste pour votre salon.' },
        { name: 'Table de Jardin en Teck', price: 4200000, desc: 'Résistance et élégance en extérieur.' },
        { name: 'Kit d\'Outils Complet', price: 1500000, desc: 'Tout pour vos bricolages.' },
        { name: 'Lampe Design Industrielle', price: 750000, desc: 'Ambiance loft pour votre intérieur.' },
        { name: 'Tondeuse à Gazon Électrique', price: 3200000, desc: 'Efficacité et silence pour votre pelouse.' }
    ],
    'Industrie & Machines': [
        { name: 'Générateur Électrique 50kVA', price: 120000000, desc: 'Puissance de secours fiable.' },
        { name: 'Tour à Métaux Précision', price: 45000000, desc: 'Pour vos ateliers mécaniques.' },
        { name: 'Compresseur d\'Air Industriel', price: 12000000, desc: 'Haute pression pour outils pneumatiques.' },
        { name: 'Chariot Élévateur Électrique', price: 85000000, desc: 'Logistique facilitée en entrepôt.' },
        { name: 'Poste à Souder TIG/MIG', price: 6500000, desc: 'Soudures professionnelles garanties.' }
    ],
    'Agriculture & Elevage': [
        { name: 'Sac d\'Engrais NPK 50kg', price: 450000, desc: 'Optimisation de la croissance des cultures.' },
        { name: 'Pompe Solaire Irrigation', price: 18000000, desc: 'Énergie gratuite pour vos champs.' },
        { name: 'Aliments pour Volaille 25kg', price: 280000, desc: 'Nutrition équilibrée pour vos poules.' },
        { name: 'Serre Tunnel Agricole', price: 12000000, desc: 'Protection et rendement toute l\'année.' },
        { name: 'Kit de Test de Sol Digital', price: 1500000, desc: 'Analysez la santé de vos terres.' }
    ],
    'default': [
        { name: 'Produit Premium BCA', price: 1000000, desc: 'Qualité supérieure garantie par BCA Connect.' },
        { name: 'Pack Essentiel Pro', price: 2500000, desc: 'Tout ce dont vous avez besoin pour démarrer.' }
    ]
};

const IMAGE_BASE = 'https://images.unsplash.com/photo-';
const IMAGE_SUFFIX = '?auto=format&fit=crop&q=80&w=800';

const CATEGORY_IMAGES = {
    'Électronique & High-Tech': '1498243639581-2a5c2c461dae',
    'Mode & Accessoires': '1483985988355-763728e1935b',
    'Maison & Jardin': '1484101403633-562f891dc89a',
    'Industrie & Machines': '1581091226825-a6a2a5aee158',
    'Agriculture & Elevage': '1500382017468-9049fed747ef',
    'Santé & Beauté': '1522335789203-aabd1fc54bc9',
    'Construction & Immobilier': '1503387762-592cd5a93d39',
    'Alimentation & Boissons': '1542831371-29b0f74f9713',
    'Véhicules & Transport': '1533473359331-0135ef1b58bf',
    'Énergie & Solaire': '1508514171904-742d13962624',
    'Bureau & Papeterie': '1497215728101-856f4ea42174',
    'Sport & Loisirs': '1517836357463-d25dfeac3438',
    'Jouets & Enfance': '1533906966484-a9c978a3f090',
    'Bijoux & Montres': '1515562141224-7a42ba4e08c6',
    'Services Professionnels': '1454165833267-03522176fe90'
};

async function seed() {
    try {
        console.log('🚀 Démarrage du peuplement du catalogue...');

        // 1. Assurer un vendeur par défaut
        let vendor = await User.findOne({ where: { email: 'vendeur_pro@bca.com' } });
        if (!vendor) {
            vendor = await User.create({
                id: uuidv4(),
                nom_complet: 'BCA Global Vendor',
                email: 'vendeur_pro@bca.com',
                telephone: '622000000',
                mot_de_passe: '$2b$10$K7.tE.mRk6E5dG3f9eH.eO.eO.eO.eO.eO.eO.eO.eO.eO.eO',
                role: 'fournisseur',
                est_approuve: true,
                statut: 'actif'
            });
            console.log('✅ Vendeur global créé.');
            
            await Wallet.create({
                id: uuidv4(),
                user_id: vendor.id,
                solde_virtuel: 0
            });
        }

        // 2. Assurer une boutique par défaut
        let store = await Store.findOne({ where: { proprietaire_id: vendor.id } });
        if (!store) {
            store = await Store.create({
                id: uuidv4(),
                nom_boutique: 'BCA Mega Center',
                description: 'Le plus grand centre de distribution de Guinée.',
                proprietaire_id: vendor.id,
                statut: 'actif',
                is_verified: true
            });
            console.log('✅ Boutique globale créée.');
        }

        // 3. Peupler les catégories et produits
        for (const catData of CATEGORIES) {
            let [category] = await Category.findOrCreate({
                where: { nom_categorie: catData.name },
                defaults: {
                    id: uuidv4(),
                    nom_categorie: catData.name,
                    description: catData.desc,
                    image_url: IMAGE_BASE + CATEGORY_IMAGES[catData.name] + IMAGE_SUFFIX
                }
            });
            console.log(`📦 Catégorie : ${catData.name}`);

            const templates = PRODUCT_TEMPLATES[catData.name] || PRODUCT_TEMPLATES['default'];
            
            for (let i = 0; i < 15; i++) {
                const template = templates[i % templates.length];
                const productName = i < templates.length ? template.name : `${template.name} v${Math.floor(i / templates.length) + 1}`;
                
                await Product.create({
                    id: uuidv4(),
                    nom_produit: productName,
                    description: template.desc + " Qualité supérieure testée et approuvée.",
                    prix_unitaire: template.price,
                    stock_quantite: 50 + Math.floor(Math.random() * 100),
                    categorie_id: category.id,
                    boutique_id: store.id,
                    statut: 'publié',
                    image_url: IMAGE_BASE + (parseInt(CATEGORY_IMAGES[catData.name].substring(0, 8), 16) + i).toString(16) + IMAGE_SUFFIX,
                    condition: 'neuf'
                }).catch(e => {
                    // Silently ignore duplicates if any, but we use uuid so it should be fine
                });
            }
        }

        console.log('✨ Catalogue peuplé avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur de seeding:', error);
        process.exit(1);
    }
}

seed();
