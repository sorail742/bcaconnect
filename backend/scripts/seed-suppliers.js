/**
 * 🏭 BCA Connect — Peuplement de l'annuaire fournisseurs
 *
 * Crée plusieurs fournisseurs réalistes (User role=fournisseur + Store vérifiée)
 * couvrant tous les secteurs, puis RÉPARTIT les produits existants entre eux
 * (par catégorie) afin que chaque fournisseur ait un catalogue cohérent.
 *
 * Idempotent : fournisseurs identifiés par email, boutiques par slug.
 *
 * Usage :  node scripts/seed-suppliers.js   (depuis backend/)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User, Store, Wallet, Product, Category } = require('../src/models');

const norm = (s) => (s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, ''); // sans accents

const logo = (kw, lock) => `https://loremflickr.com/400/400/${encodeURIComponent(kw)}?lock=${lock}`;

// Fournisseurs + secteurs (mots-clés matchés sur les noms de catégories, sans accents).
const SUPPLIERS = [
    { nom: 'Guinée Électronique SARL', contact: 'Mamadou Diallo', ville: 'Kaloum, Conakry', rating: 4.8, resp: '≈ 2 h', logoKw: 'electronics', secteurs: ['electronique', 'composant', 'surete', 'instrument'] },
    { nom: 'Conakry Mode & Textile', contact: 'Aïssatou Barry', ville: 'Madina, Conakry', rating: 4.6, resp: '≈ 3 h', logoKw: 'fashion', secteurs: ['vetement', 'chaussure', 'bagage', 'tenue', 'bijoux'] },
    { nom: 'Fouta Agro Distribution', contact: 'Ibrahima Sow', ville: 'Labé', rating: 4.7, resp: '≈ 4 h', logoKw: 'agriculture', secteurs: ['agriculture', 'animalerie'] },
    { nom: 'BTP Matériaux Guinée', contact: 'Sékou Camara', ville: 'Matoto, Conakry', rating: 4.5, resp: '≈ 5 h', logoKw: 'construction', secteurs: ['construction', 'machines pour le batiment', 'matieres', 'manutention', 'bricolage'] },
    { nom: 'Kaloum Auto Pièces', contact: 'Fodé Kourouma', ville: 'Dixinn, Conakry', rating: 4.4, resp: '≈ 3 h', logoKw: 'car', secteurs: ['vehicule', 'pieces', 'fournitures & outils auto'] },
    { nom: 'Maison & Confort GN', contact: 'Fatoumata Touré', ville: 'Ratoma, Conakry', rating: 4.6, resp: '≈ 4 h', logoKw: 'furniture', secteurs: ['maison', 'meuble', 'electromenager', 'lumiere'] },
    { nom: 'Santé Plus Distribution', contact: 'Dr. Aliou Baldé', ville: 'Matam, Conakry', rating: 4.9, resp: '≈ 1 h', logoKw: 'pharmacy', secteurs: ['medical', 'beaute', 'hygiene'] },
    { nom: 'Énergie Solaire Guinée', contact: 'Mariama Bah', ville: 'Kipé, Conakry', rating: 4.7, resp: '≈ 2 h', logoKw: 'solar', secteurs: ['energies renouvelables', "transmission d'energie", 'equipements & fournitures electriques'] },
    { nom: 'Bureau Pro Services', contact: 'Ousmane Condé', ville: 'Almamya, Conakry', rating: 4.3, resp: '≈ 3 h', logoKw: 'office', secteurs: ['bureau', 'emballage', 'service', 'services de fabrication'] },
    { nom: 'Sport & Loisirs GN', contact: 'Kadiatou Sylla', ville: 'Nongo, Conakry', rating: 4.5, resp: '≈ 4 h', logoKw: 'sport', secteurs: ['sport', 'parent', 'cadeau'] },
    { nom: 'Industrie Machines Guinée', contact: 'Alpha Oumar Diallo', ville: 'Sonfonia, Conakry', rating: 4.6, resp: '≈ 6 h', logoKw: 'machinery', secteurs: ['machines industrielles', 'equipements et machines commerciaux'] },
];

function slugify(nom) {
    return norm(nom).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function matchSupplier(catName) {
    const n = norm(catName);
    return SUPPLIERS.find((s) => s.secteurs.some((kw) => n.includes(norm(kw))));
}

async function ensureSupplier(def, lock) {
    const email = `${slugify(def.nom)}@fournisseurs.bca.gn`;
    let user = await User.findOne({ where: { email } });
    if (!user) {
        const hash = await bcrypt.hash('Fournisseur@123', 10);
        user = await User.create({
            id: uuidv4(),
            nom_complet: def.contact,
            email,
            telephone: `62${String(1000000 + lock).slice(-7)}`,
            mot_de_passe: hash,
            role: 'fournisseur',
            est_approuve: true,
            statut: 'actif',
            categorie_activite: def.secteurs[0],
        });
        await Wallet.create({ id: uuidv4(), user_id: user.id, solde_virtuel: 0 });
    }

    const slug = slugify(def.nom);
    let store = await Store.findOne({ where: { slug } });
    if (!store) {
        store = await Store.create({
            id: uuidv4(),
            nom_boutique: def.nom,
            description: `${def.nom} — fournisseur certifié BCA Connect basé à ${def.ville}. Prix directs, qualité garantie et logistique intégrée.`,
            slug,
            statut: 'actif',
            is_verified: true,
            rating: def.rating,
            temps_reponse: def.resp,
            localisation: def.ville,
            categorie_principale: def.secteurs[0],
            logo_url: logo(def.logoKw, lock),
            proprietaire_id: user.id,
        });
    } else {
        await store.update({
            statut: 'actif', is_verified: true, rating: def.rating,
            temps_reponse: def.resp, localisation: def.ville,
            logo_url: logo(def.logoKw, lock), proprietaire_id: user.id,
        });
    }
    return store;
}

async function run() {
    await sequelize.authenticate();
    console.log('🚀 Peuplement de l\'annuaire fournisseurs...');

    // 1. Créer/mettre à jour les fournisseurs.
    const stores = [];
    let lock = 10;
    for (const def of SUPPLIERS) {
        lock += 1;
        const store = await ensureSupplier(def, lock);
        stores.push({ def, store });
        console.log(`🏪 ${def.nom} (${def.ville})`);
    }

    // 2. Répartir les produits par catégorie vers le fournisseur du secteur.
    const categories = await Category.findAll();
    const storeByName = new Map(stores.map((s) => [s.def.nom, s.store]));
    let reassigned = 0;
    let unmatched = 0;
    const fallback = storeByName.get('Bureau Pro Services'); // secteur générique

    for (const cat of categories) {
        const sup = matchSupplier(cat.nom_categorie);
        const target = sup ? storeByName.get(sup.nom) : fallback;
        if (!sup) unmatched += 1;
        const [count] = await Product.update(
            { boutique_id: target.id },
            { where: { categorie_id: cat.id } },
        );
        reassigned += count;
    }

    // 3. Répartir la catégorie image de la boutique = image d'un de ses produits.
    for (const { store } of stores) {
        const p = await Product.findOne({ where: { boutique_id: store.id }, attributes: ['image_url'] });
        if (p && p.image_url && !store.logo_url) await store.update({ logo_url: p.image_url });
    }

    const totalStores = await Store.count({ where: { statut: 'actif', is_verified: true } });
    console.log(`\n✨ ${stores.length} fournisseurs prêts | ${reassigned} produits répartis (${unmatched} catégories via fallback).`);
    console.log(`   Boutiques vérifiées actives en base : ${totalStores}`);
    await sequelize.close();
    process.exit(0);
}

run().catch((e) => { console.error('❌ Erreur seed fournisseurs :', e); process.exit(1); });
