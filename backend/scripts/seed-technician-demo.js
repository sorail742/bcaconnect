/**
 * Seed missions SAV pour le dashboard technicien
 * Usage: node scripts/seed-technician-demo.js
 */
require('dotenv').config();
const { User, Product, Store, Intervention } = require('../src/models');

const DEMO_MISSIONS = [
    {
        description: 'Climatiseur ne refroidit plus — bruit anormal au démarrage.',
        productName: 'Climatiseur Split 12000 BTU',
        marque: 'LG',
    },
    {
        description: 'Fuite d\'eau sous l\'évier de la cuisine, pression faible.',
        productName: 'Pompe à eau domestique',
        marque: 'Grundfos',
    },
    {
        description: 'Panne électrique récurrente — disjoncteur qui saute.',
        productName: 'Tableau électrique 12 modules',
        marque: 'Schneider',
    },
];

async function seed() {
    try {
        const client = await User.findOne({ where: { email: 'client@test.com' } });
        if (!client) {
            console.error('❌ Compte client@test.com introuvable. Lancez: node scripts/create-test-accounts.js');
            process.exit(1);
        }

        const fournisseur = await User.findOne({ where: { email: 'fournisseur@test.com' } });
        let store = null;
        if (fournisseur) {
            store = await Store.findOne({ where: { proprietaire_id: fournisseur.id } });
        }

        let created = 0;
        for (const demo of DEMO_MISSIONS) {
            const existing = await Intervention.findOne({
                where: { description_probleme: demo.description, demandeur_id: client.id },
            });
            if (existing) {
                console.log(`⚠️  Mission déjà existante : ${demo.productName}`);
                continue;
            }

            let product = await Product.findOne({ where: { nom_produit: demo.productName } });
            if (!product) {
                product = await Product.create({
                    nom_produit: demo.productName,
                    marque: demo.marque,
                    description: `Produit démo SAV — ${demo.productName}`,
                    prix_unitaire: 250000,
                    stock_quantite: 5,
                    boutique_id: store?.id || null,
                });
            }

            await Intervention.create({
                produit_id: product.id,
                demandeur_id: client.id,
                description_probleme: demo.description,
                status: 'en_attente',
            });

            created++;
            console.log(`✅ Mission créée : ${demo.productName}`);
        }

        console.log(`\n✨ ${created} mission(s) SAV ajoutée(s) pour le technicien.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur seed technicien:', err.message);
        process.exit(1);
    }
}

seed();
