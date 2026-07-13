/**
 * 🖼️  BCA Connect — Peuplement du catalogue avec produits + images par catégorie
 *
 * Pour CHAQUE catégorie existante en base, crée un jeu de produits réalistes
 * (noms + prix en GNF) avec une image VALIDE :
 *   - pool Unsplash curé (URLs vérifiées 200) pour les grands thèmes,
 *   - fallback loremflickr par mot-clé (toujours valide, pertinent) sinon.
 *
 * Idempotent : les produits créés sont marqués (mots_cles inclut 'seed:catalog-images')
 * et supprimés/recréés à chaque exécution — les produits réels des utilisateurs sont préservés.
 *
 * Usage :  node scripts/seed-catalog-images.js            (8 produits / catégorie)
 *          node scripts/seed-catalog-images.js --count=12 (n produits / catégorie)
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { sequelize, Category, Product, Store, User, Wallet } = require('../src/models');

// Chaque produit reçoit une image DISTINCTE et pertinente :
// loremflickr par mot-clé (1er tag) + `lock` GLOBAL unique → aucune répétition.
// (Les pools Unsplash partagés ont été retirés : trop peu d'images, mêmes visuels
//  réutilisés sur plusieurs catégories.)
const flickr = (keyword, lock) => {
    const tag = String(keyword).split(',')[0].trim().replace(/\s+/g, '');
    return `https://loremflickr.com/700/700/${encodeURIComponent(tag)}?lock=${lock}`;
};
const pickImage = (keyword, lock) => flickr(keyword, lock);

// ─── Taxonomie : catégorie → thème image + mot-clé + produits (nom, prix GNF) ──
// Prix en francs guinéens (GNF).
const CATALOG = {
    'Agriculture, Aliments & Boissons': { theme: 'agriculture', kw: 'agriculture,farm,harvest', produits: [['Sac de riz local 50kg', 450000], ['Engrais NPK 25kg', 320000], ['Huile de palme 20L', 380000], ['Sac de maïs 50kg', 290000], ['Semences maraîchères (lot)', 180000], ['Bidon de miel pur 5L', 550000]] },
    'Animalerie': { theme: null, kw: 'pet,dog,animal', produits: [['Croquettes chien 15kg', 420000], ['Cage à volaille galvanisée', 650000], ['Aliment volaille 25kg', 280000], ['Abreuvoir automatique', 95000], ['Litière chat 10L', 120000]] },
    'Bagages, Sacs, Étuis': { theme: 'fashion', kw: 'luggage,bag,suitcase', produits: [['Valise rigide 4 roues', 780000], ['Sac à dos business', 320000], ['Sac de voyage cuir', 540000], ['Trousse de toilette', 85000], ['Mallette ordinateur', 260000]] },
    'Bijoux, Lunettes & Montres': { theme: null, kw: 'jewelry,watch,luxury', produits: [['Montre automatique acier', 1850000], ['Lunettes de soleil UV400', 320000], ['Collier plaqué or', 680000], ['Bracelet artisanal', 210000], ['Montre connectée', 950000]] },
    'Bricolage & Quincaillerie': { theme: 'industrial', kw: 'tools,hardware,diy', produits: [['Perceuse-visseuse 18V', 720000], ['Coffret 200 outils', 850000], ['Meuleuse d\'angle 850W', 480000], ['Lot de vis assorties', 65000], ['Échelle télescopique 4m', 560000]] },
    'Cadeaux & Artisanat': { theme: null, kw: 'handmade,craft,gift', produits: [['Statuette bois sculpté', 240000], ['Panier tressé artisanal', 95000], ['Tissu wax premium (6 yards)', 320000], ['Bougie parfumée déco', 55000], ['Set cadeau artisanal', 180000]] },
    'Chaussures & Accessoires': { theme: 'fashion', kw: 'shoes,sneakers,footwear', produits: [['Sneakers urbaines', 480000], ['Chaussures de ville cuir', 620000], ['Sandales confort', 180000], ['Bottes de sécurité', 350000], ['Ceinture cuir véritable', 145000]] },
    'Composants électroniques': { theme: 'tech', kw: 'electronics,circuit,components', produits: [['Carte Arduino Uno', 180000], ['Kit résistances (lot)', 45000], ['Module Wi-Fi ESP32', 95000], ['Alimentation régulée 12V', 220000], ['Câble HDMI 4K 2m', 60000]] },
    'Construction & Immobilier': { theme: 'home', kw: 'construction,building,cement', produits: [['Sac de ciment 50kg', 95000], ['Tôle bac galvanisée', 180000], ['Brique creuse (palette)', 1200000], ['Fer à béton 12mm', 85000], ['Sac de gravier 50kg', 40000]] },
    'Emballage & Impression': { theme: 'office', kw: 'packaging,box,printing', produits: [['Rouleau film étirable', 120000], ['Lot 100 cartons kraft', 350000], ['Ruban adhésif (pack 6)', 48000], ['Imprimante étiquettes', 890000], ['Sacs kraft (lot 500)', 160000]] },
    'Fournitures & Outils auto': { theme: 'vehicles', kw: 'car,auto,tools', produits: [['Cric hydraulique 3T', 380000], ['Kit clés à cliquet', 290000], ['Compresseur portable 12V', 175000], ['Huile moteur 5L', 220000], ['Batterie 12V 70Ah', 650000]] },
    'Fournitures de bureau': { theme: 'office', kw: 'office,stationery,desk', produits: [['Ramette papier A4 (5x)', 240000], ['Fauteuil de bureau ergo', 780000], ['Lot stylos + cahiers', 65000], ['Destructeur de documents', 420000], ['Tableau blanc 120cm', 190000]] },
    'Hygiène perso & Ménage': { theme: 'beauty', kw: 'hygiene,cleaning,soap', produits: [['Pack savon (lot 12)', 85000], ['Détergent multi-surfaces 5L', 95000], ['Papier hygiénique (24 rlx)', 120000], ['Gel hydroalcoolique 1L', 55000], ['Set nettoyage maison', 180000]] },
    'Instrument & Équipement de test': { theme: 'industrial', kw: 'measurement,multimeter,instrument', produits: [['Multimètre numérique', 320000], ['Pied à coulisse digital', 180000], ['Testeur de tension', 95000], ['Thermomètre infrarouge', 150000], ['Balance de précision', 420000]] },
    'Lumière & Éclairage': { theme: null, kw: 'lighting,lamp,led', produits: [['Ampoule LED 12W (pack 10)', 120000], ['Projecteur LED 100W', 280000], ['Lampe solaire de jardin', 95000], ['Réglette LED 120cm', 140000], ['Guirlande LED extérieure', 85000]] },
    'Machines industrielles': { theme: 'industrial', kw: 'industrial,machinery,factory', produits: [['Compresseur d\'air 100L', 4800000], ['Poste à souder MIG', 3200000], ['Groupe électrogène 10kVA', 18000000], ['Tour à métaux', 12000000], ['Pompe industrielle', 2600000]] },
    'Machines pour le Bâtiment & la Construction': { theme: 'industrial', kw: 'construction,machinery,excavator', produits: [['Bétonnière 350L', 5200000], ['Marteau-piqueur électrique', 1800000], ['Vibreur à béton', 950000], ['Échafaudage mobile', 2400000], ['Brouette renforcée', 320000]] },
    'Maison & Jardin': { theme: 'home', kw: 'home,garden,furniture', produits: [['Salon de jardin résine', 3200000], ['Tondeuse thermique', 2100000], ['Barbecue charbon', 480000], ['Kit outils jardinage', 220000], ['Parasol déporté 3m', 650000]] },
    'Manutention': { theme: 'industrial', kw: 'warehouse,forklift,pallet', produits: [['Transpalette manuel 2.5T', 2800000], ['Diable pliable 200kg', 320000], ['Chariot de manutention', 850000], ['Sangles d\'arrimage (lot)', 95000], ['Gerbeur manuel 1T', 4500000]] },
    'Matières premières': { theme: null, kw: 'raw material,steel,industrial', produits: [['Bobine acier galvanisé', 3800000], ['Granulés plastique 25kg', 420000], ['Résine époxy 20L', 680000], ['Feuille aluminium (rouleau)', 550000], ['Sable industriel (tonne)', 280000]] },
    'Meubles': { theme: 'home', kw: 'furniture,sofa,interior', produits: [['Canapé 3 places', 4200000], ['Lit double + matelas', 3500000], ['Armoire 3 portes', 2800000], ['Table à manger 6 pers.', 1900000], ['Étagère bibliothèque', 780000]] },
    'Médical & Santé': { theme: 'beauty', kw: 'medical,health,pharmacy', produits: [['Tensiomètre électronique', 320000], ['Thermomètre frontal', 95000], ['Kit premiers secours', 180000], ['Oxymètre de pouls', 120000], ['Fauteuil roulant pliable', 1450000]] },
    'Parents, Enfants & Jouets': { theme: null, kw: 'toys,kids,baby', produits: [['Poussette 3 roues', 980000], ['Lot jouets éducatifs', 240000], ['Vélo enfant 16"', 620000], ['Chaise haute bébé', 380000], ['Puzzle en bois', 65000]] },
    'Pièces & Accessoires pour véhicules': { theme: 'vehicles', kw: 'car parts,tire,engine', produits: [['Pneu 195/65 R15', 680000], ['Plaquettes de frein (jeu)', 220000], ['Filtre à huile (lot 3)', 85000], ['Balais d\'essuie-glace', 55000], ['Amortisseur avant', 420000]] },
    'Produits de beauté': { theme: 'beauty', kw: 'beauty,cosmetics,makeup', produits: [['Coffret maquillage', 380000], ['Crème hydratante visage', 95000], ['Parfum eau de toilette', 450000], ['Sèche-cheveux pro', 280000], ['Set soins capillaires', 180000]] },
    'Service': { theme: null, kw: 'business,service,office', produits: [['Forfait maintenance IT', 1500000], ['Prestation nettoyage pro', 800000], ['Abonnement support technique', 1200000], ['Audit sécurité', 2500000], ['Formation logiciel', 950000]] },
    'Services de fabrication': { theme: 'industrial', kw: 'manufacturing,factory,production', produits: [['Impression 3D sur mesure', 650000], ['Découpe laser (service)', 850000], ['Usinage CNC pièce', 1200000], ['Moulage plastique (lot)', 2200000], ['Soudure industrielle', 780000]] },
    'Sports & Loisirs': { theme: null, kw: 'sport,fitness,gym', produits: [['Tapis de course pliable', 2800000], ['Set haltères 20kg', 480000], ['Vélo d\'appartement', 1650000], ['Ballon de football pro', 120000], ['Tente 4 places', 650000]] },
    'Sûreté & sécurité': { theme: 'tech', kw: 'security,camera,cctv', produits: [['Caméra surveillance IP', 420000], ['Kit vidéosurveillance 4 cam', 2200000], ['Détecteur de fumée', 85000], ['Coffre-fort électronique', 980000], ['Alarme sans fil', 650000]] },
    "Tenues de sport et vêtements d'extérieur": { theme: 'fashion', kw: 'sportswear,jacket,outdoor', produits: [['Veste imperméable', 380000], ['Survêtement complet', 320000], ['Chaussures running', 520000], ['Legging sport', 145000], ['Doudoune outdoor', 680000]] },
    "Transmission d'énergie": { theme: 'industrial', kw: 'power,cable,electrical', produits: [['Câble électrique 100m', 850000], ['Transformateur 5kVA', 3200000], ['Disjoncteur triphasé', 280000], ['Onduleur 3000VA', 1800000], ['Coffret de distribution', 650000]] },
    'Véhicules et transport': { theme: 'vehicles', kw: 'car,motorcycle,vehicle', produits: [['Moto 125cc', 12000000], ['Tricycle utilitaire', 28000000], ['Vélo VTT 26"', 980000], ['Scooter électrique', 8500000], ['Remorque bagagère', 3200000]] },
    'Vêtements & Accessoires': { theme: 'fashion', kw: 'clothing,fashion,apparel', produits: [['Chemise coton (lot 3)', 320000], ['Jean slim homme', 280000], ['Robe wax élégante', 380000], ['T-shirt premium (pack 5)', 220000], ['Costume 2 pièces', 950000]] },
    'Électroménager': { theme: 'home', kw: 'appliance,kitchen,refrigerator', produits: [['Réfrigérateur 250L', 4200000], ['Machine à laver 8kg', 3800000], ['Climatiseur split 12000 BTU', 3500000], ['Micro-ondes 25L', 850000], ['Mixeur blender 1.5L', 320000]] },
    'Électronique grand public': { theme: 'tech', kw: 'electronics,smartphone,laptop', produits: [['Smartphone 128Go', 3200000], ['Ordinateur portable 15"', 6800000], ['Téléviseur LED 43"', 2900000], ['Écouteurs sans fil', 420000], ['Tablette 10"', 1900000]] },
    'Énergies renouvelables': { theme: null, kw: 'solar,renewable,panel', produits: [['Panneau solaire 400W', 1450000], ['Batterie lithium 100Ah', 3200000], ['Kit solaire maison 2kW', 8500000], ['Régulateur MPPT 60A', 680000], ['Lampe solaire portable', 120000]] },
    'Équipements & Fournitures Électriques': { theme: 'industrial', kw: 'electrical,wiring,switch', produits: [['Tableau électrique 12 modules', 380000], ['Prises + interrupteurs (lot)', 120000], ['Gaine ICTA 100m', 95000], ['Multiprise parafoudre', 65000], ['Boîte de dérivation (lot 10)', 48000]] },
    'Équipements et machines commerciaux': { theme: 'industrial', kw: 'commercial,equipment,retail', produits: [['Vitrine réfrigérée', 6500000], ['Caisse enregistreuse', 1200000], ['Balance commerciale', 480000], ['Présentoir métallique', 650000], ['Four professionnel', 4800000]] },
};

async function ensureVendorAndStore() {
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
            statut: 'actif',
        });
        await Wallet.create({ id: uuidv4(), user_id: vendor.id, solde_virtuel: 0 });
    }
    let store = await Store.findOne({ where: { proprietaire_id: vendor.id } });
    if (!store) store = await Store.findOne(); // réutiliser une boutique existante si présente
    if (!store) {
        store = await Store.create({
            id: uuidv4(),
            nom_boutique: 'BCA Mega Center',
            description: 'Le plus grand centre de distribution de Guinée.',
            proprietaire_id: vendor.id,
            statut: 'actif',
            is_verified: true,
        });
    }
    return store;
}

async function run() {
    const args = process.argv.slice(2);
    const countArg = args.find((a) => a.startsWith('--count='));
    const perCategory = countArg ? Math.max(1, parseInt(countArg.split('=')[1], 10) || 8) : 8;

    await sequelize.authenticate();
    console.log(`🚀 Peuplement du catalogue (${perCategory} produits/catégorie)...`);

    const store = await ensureVendorAndStore();
    const categories = await Category.findAll();
    const catByName = new Map(categories.map((c) => [c.nom_categorie, c]));

    // Nettoyage idempotent : supprimer les produits déjà semés par ce script.
    const { Op } = require('sequelize');
    const existing = await Product.findAll({ attributes: ['id', 'mots_cles'] });
    const seededIds = existing
        .filter((p) => Array.isArray(p.mots_cles) && p.mots_cles.includes('seed:catalog-images'))
        .map((p) => p.id);
    if (seededIds.length) {
        await Product.destroy({ where: { id: { [Op.in]: seededIds } } });
        console.log(`🧹 ${seededIds.length} anciens produits de démo supprimés.`);
    }

    let created = 0;
    let missing = 0;
    let imgLock = 0; // compteur GLOBAL → image unique par produit
    for (const [catName, def] of Object.entries(CATALOG)) {
        const category = catByName.get(catName);
        if (!category) { missing += 1; console.warn(`⚠️  Catégorie absente en base : ${catName}`); continue; }

        const rows = [];
        for (let i = 0; i < perCategory; i += 1) {
            const [baseName, basePrice] = def.produits[i % def.produits.length];
            const variant = Math.floor(i / def.produits.length);
            const nom = variant === 0 ? baseName : `${baseName} — Lot ${variant + 1}`;
            const jitter = 1 + ((i % 5) - 2) * 0.04; // ±8% variation de prix
            const prix = Math.round((basePrice * jitter) / 1000) * 1000;
            const remise = i % 3 === 0 ? Math.round((prix * 1.15) / 1000) * 1000 : null;
            imgLock += 1;
            rows.push({
                id: uuidv4(),
                nom_produit: nom,
                description: `${baseName} — qualité vérifiée BCA Connect. Fournisseur certifié, paiement sécurisé (escrow) et livraison à Conakry et à l'intérieur du pays.`,
                prix_unitaire: prix,
                prix_ancien: remise,
                stock_quantite: 20 + Math.floor(Math.random() * 180),
                categorie_id: category.id,
                boutique_id: store.id,
                image_url: pickImage(def.kw, imgLock),
                condition: 'neuf',
                est_local: true,
                unite_mesure: 'Pièce',
                mots_cles: ['seed:catalog-images', catName],
            });
        }

        // Image de la catégorie = image du 1er produit (mot-clé anglais pertinent, unique).
        await category.update({ image_url: rows[0].image_url });
        await Product.bulkCreate(rows);
        created += rows.length;
        console.log(`📦 ${catName} → ${rows.length} produits`);
    }

    console.log(`\n✨ Terminé : ${created} produits créés sur ${Object.keys(CATALOG).length - missing} catégories.`);
    if (missing) console.log(`   (${missing} catégories du script introuvables en base)`);
    await sequelize.close();
    process.exit(0);
}

run().catch((e) => { console.error('❌ Erreur seeding catalogue :', e); process.exit(1); });
