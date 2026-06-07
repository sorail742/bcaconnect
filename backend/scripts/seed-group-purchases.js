/**
 * Seed campagnes d'achats groupés (ONG / B2B)
 * Usage: node scripts/seed-group-purchases.js
 */
require('dotenv').config();
const { User, Product, AchatGroupe } = require('../src/models');

const DEMO_CAMPAIGNS = [
    {
        titre: 'Kits scolaires — ONG Éducation Guinée',
        description: 'Mutualisation de l\'achat de fournitures scolaires pour 3 écoles rurales de Kindia.',
        quantite_cible: 50,
        quantite_actuelle: 32,
        remise_pct: 15,
        zone_livraison: 'Kindia',
        type_organisateur: 'ong',
        daysLeft: 14,
        productName: 'Kit scolaire complet',
    },
    {
        titre: 'Pompes à eau solaires — Projet rural',
        description: 'Achat groupé de pompes solaires pour 10 villages de la région de Labé.',
        quantite_cible: 20,
        quantite_actuelle: 8,
        remise_pct: 20,
        zone_livraison: 'Labé',
        type_organisateur: 'ong',
        daysLeft: 21,
        productName: 'Pompe à eau domestique',
    },
    {
        titre: 'Climatiseurs PME — Bureau Conakry',
        description: 'Commande groupée de climatiseurs pour PME du quartier Kaloum.',
        quantite_cible: 10,
        quantite_actuelle: 10,
        remise_pct: 12,
        zone_livraison: 'Conakry — Kaloum',
        type_organisateur: 'pme',
        daysLeft: 7,
        statut: 'atteint',
        productName: 'Climatiseur Split 12000 BTU',
    },
];

async function seed() {
    try {
        const client = await User.findOne({ where: { email: 'client@test.com' } });
        if (!client) {
            console.error('❌ Compte client@test.com introuvable. Lancez: npm run seed:accounts');
            process.exit(1);
        }

        let created = 0;
        for (const demo of DEMO_CAMPAIGNS) {
            const existing = await AchatGroupe.findOne({ where: { titre: demo.titre } });
            if (existing) {
                console.log(`⚠️  Campagne déjà existante : ${demo.titre}`);
                continue;
            }

            let product = await Product.findOne({ where: { nom_produit: demo.productName } });
            if (!product) {
                product = await Product.create({
                    nom_produit: demo.productName,
                    marque: 'BCA Demo',
                    description: `Produit démo achat groupé — ${demo.productName}`,
                    prix_unitaire: 350000,
                    stock_quantite: 100,
                });
            }

            const prixNormal = parseFloat(product.prix_unitaire);
            const prixGroupe = Math.round(prixNormal * (1 - demo.remise_pct / 100));
            const dateLimite = new Date();
            dateLimite.setDate(dateLimite.getDate() + demo.daysLeft);

            await AchatGroupe.create({
                organisateur_id: client.id,
                produit_id: product.id,
                titre: demo.titre,
                description: demo.description,
                quantite_cible: demo.quantite_cible,
                quantite_actuelle: demo.quantite_actuelle,
                prix_unitaire_normal: prixNormal,
                prix_unitaire_groupe: prixGroupe,
                remise_pct: demo.remise_pct,
                date_limite: dateLimite,
                zone_livraison: demo.zone_livraison,
                type_organisateur: demo.type_organisateur,
                statut: demo.statut || 'ouvert',
            });

            created++;
            console.log(`✅ Campagne créée : ${demo.titre}`);
        }

        console.log(`\n✨ ${created} campagne(s) d'achat groupé ajoutée(s).`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur seed achats groupés:', err.message);
        process.exit(1);
    }
}

seed();
