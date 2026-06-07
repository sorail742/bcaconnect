/**
 * Seed contenu éducation BCA Academy
 * Usage: npm run seed:education
 */
require('dotenv').config();
const { EducationalResource, sequelize } = require('../src/models');

const RESOURCES = [
    {
        titre: 'Optimiser vos fiches produits sur BCA Connect',
        description: 'Photos, descriptions et prix : les bonnes pratiques pour vendre plus en Guinée.',
        type_contenu: 'guide',
        url_contenu: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        audience_cible: 'fournisseurs',
        tag: 'Vente',
    },
    {
        titre: 'Comprendre le séquestre (Escrow) BCA',
        description: 'Comment fonctionne la protection acheteur/vendeur jusqu\'à la livraison confirmée.',
        type_contenu: 'video',
        url_contenu: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        audience_cible: 'tous',
        tag: 'Sécurité',
    },
    {
        titre: 'Tarification en GNF : fixer le bon prix',
        description: 'Marges, frais de port et concurrence locale — guide pratique pour Conakry et l\'intérieur.',
        type_contenu: 'article',
        url_contenu: 'https://fr.wikipedia.org/wiki/Guinée',
        audience_cible: 'fournisseurs',
        tag: 'Business',
    },
    {
        titre: 'Paiement Mobile Money : Orange & MTN',
        description: 'Étapes pour payer en toute sécurité via wallet ou Mobile Money sur la plateforme.',
        type_contenu: 'guide',
        url_contenu: 'https://fr.wikipedia.org/wiki/Mobile_money',
        audience_cible: 'clients',
        tag: 'Paiement',
    },
    {
        titre: 'Livraison GPS et validation OTP',
        description: 'Rôle du transporteur, suivi en temps réel et confirmation de livraison.',
        type_contenu: 'video',
        url_contenu: 'https://www.openstreetmap.org',
        audience_cible: 'transporteurs',
        tag: 'Logistique',
    },
    {
        titre: 'Achats groupés pour ONG et coopératives',
        description: 'Créer une campagne, inviter des participants et clôturer avec commandes automatiques.',
        type_contenu: 'pdf',
        url_contenu: 'https://fr.wikipedia.org/wiki/Organisation_non_gouvernementale',
        audience_cible: 'tous',
        tag: 'Achats groupés',
    },
    {
        titre: 'Crédit BCA : simulateur et demande',
        description: 'Comment utiliser le simulateur, soumettre une demande et suivre l\'approbation banque.',
        type_contenu: 'article',
        url_contenu: 'https://fr.wikipedia.org/wiki/Crédit',
        audience_cible: 'clients',
        tag: 'Crédit',
    },
    {
        titre: 'Gestion des litiges et médiation',
        description: 'Ouvrir un litige, fournir des preuves et comprendre les résolutions possibles.',
        type_contenu: 'guide',
        url_contenu: 'https://fr.wikipedia.org/wiki/Litige',
        audience_cible: 'tous',
        tag: 'Litiges',
    },
];

async function run() {
    console.log('\n📚 Seed éducation — BCA Academy\n');

    await sequelize.sync();

    const existing = await EducationalResource.count();
    if (existing >= RESOURCES.length) {
        console.log(`  ℹ️  ${existing} ressource(s) déjà en base — seed ignoré.`);
        console.log('  Pour forcer : supprimez les entrées de educational_resources puis relancez.\n');
        await sequelize.close();
        return;
    }

    let created = 0;
    for (const data of RESOURCES) {
        const [, wasCreated] = await EducationalResource.findOrCreate({
            where: { titre: data.titre },
            defaults: data,
        });
        if (wasCreated) {
            console.log(`  ✅ ${data.titre}`);
            created++;
        }
    }

    console.log(`\n✅ ${created} ressource(s) créée(s) (${await EducationalResource.count()} au total).\n`);
    await sequelize.close();
}

run().catch((err) => {
    console.error('💥', err.message);
    process.exit(1);
});
