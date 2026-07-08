/**
 * Script de mise à jour des images produits
 * Assigne des images uniques et contextualisées (contexte africain/guinéen)
 * via des URLs Unsplash spécifiques à chaque type de produit
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

const dbPath = path.join(__dirname, '../src/data/database.sqlite');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: dbPath, logging: false });

// Map : mot-clé dans le nom produit → image Unsplash précise et contextuelle
const IMAGE_MAP = [
  // ── Électronique & Téléphones ─────────────────────────────────────────────
  { keywords: ['iphone', 'samsung', 'smartphone', 'téléphone', 'telephone', 'mobile'], url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80' },
  { keywords: ['ordinateur', 'laptop', 'pc portable', 'macbook'], url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80' },
  { keywords: ['tablette', 'ipad'], url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80' },
  { keywords: ['télévision', 'tv', 'smart tv', 'écran'], url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=80' },
  { keywords: ['casque', 'écouteur', 'airpod', 'headphone'], url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
  { keywords: ['imprimante', 'scanner'], url: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80' },
  { keywords: ['batterie', 'chargeur', 'power bank'], url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80' },
  { keywords: ['appareil photo', 'camera', 'caméra', 'gopro'], url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80' },

  // ── Électroménager ───────────────────────────────────────────────────────
  { keywords: ['climatiseur', 'split', 'clim', 'ventilateur'], url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80' },
  { keywords: ['réfrigérateur', 'frigo', 'congélateur'], url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80' },
  { keywords: ['machine à laver', 'lave-linge', 'sèche-linge'], url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80' },
  { keywords: ['four', 'micro-onde', 'micro onde'], url: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&q=80' },
  { keywords: ['mixeur', 'blender', 'robot', 'centrifugeuse'], url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80' },
  { keywords: ['fer à repasser', 'repassage'], url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80' },
  { keywords: ['cuisinière', 'gaz', 'plaque de cuisson', 'réchaud'], url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },

  // ── Alimentation & Agro ──────────────────────────────────────────────────
  { keywords: ['riz', 'sac de riz'], url: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b2b7?w=600&q=80' },
  { keywords: ['maïs', 'mais', 'céréale'], url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80' },
  { keywords: ['huile', 'huile de palme', 'huile végétale'], url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80' },
  { keywords: ['miel', 'ruche'], url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=80' },
  { keywords: ['farine', 'blé', 'pain'], url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
  { keywords: ['cacao', 'chocolat'], url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80' },
  { keywords: ['café'], url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80' },
  { keywords: ['thé'], url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80' },
  { keywords: ['piment', 'épice', 'condiment'], url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&q=80' },
  { keywords: ['légume', 'tomate', 'oignon', 'aubergine'], url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80' },
  { keywords: ['poisson', 'tilapia', 'thon', 'sardine'], url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&q=80' },
  { keywords: ['poulet', 'volaille', 'viande'], url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80' },

  // ── Agriculture & Élevage ─────────────────────────────────────────────────
  { keywords: ['engrais', 'npk', 'fertilisant'], url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80' },
  { keywords: ['semence', 'graine', 'maraîcher'], url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80' },
  { keywords: ['tracteur', 'motoculteur', 'machine agricole'], url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80' },
  { keywords: ['volaille', 'cage', 'abreuvoir', 'aliment volaille'], url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&q=80' },
  { keywords: ['chien', 'chat', 'croquette', 'litière', 'animal'], url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80' },

  // ── BTP & Matériaux ──────────────────────────────────────────────────────
  { keywords: ['ciment', 'béton', 'mortier'], url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { keywords: ['barre', 'fer', 'acier', 'ferraille'], url: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80' },
  { keywords: ['tôle', 'toiture', 'zinc'], url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { keywords: ['peinture', 'enduit', 'vernis'], url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80' },
  { keywords: ['carrelage', 'marbre', 'granit'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['bois', 'planche', 'contreplaqué'], url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&q=80' },
  { keywords: ['outil', 'perceuse', 'marteau', 'tournevis', 'clé'], url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80' },
  { keywords: ['câble', 'électrique', 'tableau électrique', 'interrupteur', 'prise'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['pompe', 'pompe à eau', 'forage'], url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80' },
  { keywords: ['groupe électrogène', 'générateur', 'onduleur'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['panneau solaire', 'solaire', 'énergie'], url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80' },

  // ── Mode & Textile ───────────────────────────────────────────────────────
  { keywords: ['boubou', 'pagné', 'tissu africain', 'wax', 'bazin', 'soie guinéenne'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['robe', 'jupe', 'tenue femme', 'habit'], url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80' },
  { keywords: ['costume', 'veste', 'chemise homme', 'pantalon'], url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80' },
  { keywords: ['chaussure', 'basket', 'sandale', 'mocassin', 'escarpin'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { keywords: ['sac à main', 'pochette', 'maroquinerie'], url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
  { keywords: ['bijou', 'collier', 'bracelet', 'bague', 'or', 'argent'], url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
  { keywords: ['montre'], url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
  { keywords: ['lunette', 'soleil'], url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80' },
  { keywords: ['parfum', 'déodorant', 'colonie'], url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80' },

  // ── Mobilier & Maison ────────────────────────────────────────────────────
  { keywords: ['canapé', 'sofa', 'salon', 'fauteuil'], url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
  { keywords: ['lit', 'matelas', 'chambre à coucher', 'sommier'], url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80' },
  { keywords: ['armoire', 'placard', 'garde-robe'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['bureau', 'table de bureau', 'chaise bureau'], url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80' },
  { keywords: ['chaise', 'tabouret', 'banc'], url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80' },
  { keywords: ['table', 'table à manger', 'table basse'], url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
  { keywords: ['rideau', 'nappe', 'draps', 'linge'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['vaisselle', 'assiette', 'bol', 'marmite', 'casserole', 'ustensile'], url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },

  // ── Commerce & Équipement Professionnel ──────────────────────────────────
  { keywords: ['vitrine', 'étagère', 'présentoir'], url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80' },
  { keywords: ['caisse enregistreuse', 'tpe', 'terminal paiement'], url: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=600&q=80' },
  { keywords: ['balance', 'pèse', 'bascule'], url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80' },
  { keywords: ['réfrigérateur commercial', 'congélateur commercial'], url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80' },

  // ── Santé & Beauté ───────────────────────────────────────────────────────
  { keywords: ['médicament', 'pharmacie', 'soin', 'vitamine'], url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80' },
  { keywords: ['crème', 'cosmétique', 'maquillage', 'lotion', 'shampoing'], url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80' },
  { keywords: ['coiffure', 'perruque', 'cheveux', 'extension'], url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80' },
  { keywords: ['masque', 'gel hydroalcoolique', 'désinfectant'], url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80' },

  // ── Automobile & Moto ─────────────────────────────────────────────────────
  { keywords: ['voiture', 'berline', 'suv', 'bus', 'véhicule'], url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80' },
  { keywords: ['moto', 'scooter', 'tricycle', 'bajaj'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['pneu', 'jante', 'roue'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['huile moteur', 'lubrifiant', 'filtre'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { keywords: ['batterie auto', 'batterie moto', 'batterie véhicule'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },

  // ── Voyage & Bagagerie ────────────────────────────────────────────────────
  { keywords: ['valise'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
  { keywords: ['sac à dos', 'sac voyage', 'sac business'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
  { keywords: ['mallette', 'porte-documents'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
  { keywords: ['trousse'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },

  // ── Scolaire & Bureau ─────────────────────────────────────────────────────
  { keywords: ['kit scolaire', 'fourniture', 'cahier', 'stylo', 'cartable'], url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80' },
  { keywords: ['livre', 'manuel', 'dictionnaire'], url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80' },
  { keywords: ['imprimante', 'cartouche', 'papier a4'], url: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80' },

  // ── Sport & Loisirs ────────────────────────────────────────────────────────
  { keywords: ['ballon', 'foot', 'football', 'basket'], url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80' },
  { keywords: ['maillot', 'équipement sport', 'tenue sport'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { keywords: ['guitare', 'djembé', 'instrument'], url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80' },
  { keywords: ['jeu', 'jouet', 'enfant', 'bébé'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
];

// Image de fallback par défaut (marché africain)
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';

function getImageForProduct(productName) {
  const nameLower = productName.toLowerCase();
  for (const entry of IMAGE_MAP) {
    for (const keyword of entry.keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        return entry.url;
      }
    }
  }
  return DEFAULT_IMAGE;
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie.');

    const [products] = await sequelize.query('SELECT id, nom_produit, image_url FROM produits;');
    console.log(`📦 ${products.length} produits trouvés.`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      const newUrl = getImageForProduct(product.nom_produit);
      
      if (newUrl === product.image_url) {
        skipped++;
        continue;
      }

      await sequelize.query(
        'UPDATE produits SET image_url = ? WHERE id = ?;',
        { replacements: [newUrl, product.id] }
      );
      console.log(`  🖼️  [${product.nom_produit}] → image mise à jour`);
      updated++;
    }

    console.log(`\n✅ Terminé ! ${updated} produits mis à jour, ${skipped} déjà corrects.`);
    await sequelize.close();
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    process.exit(1);
  }
}

run();
