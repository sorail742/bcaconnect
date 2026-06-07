/**
 * Crée des commandes prêtes pour le transporteur (statut_livraison: pret).
 * Usage: node scripts/seed-carrier-demo.js
 */
const { sequelize, Order, User } = require('../src/models');

const ZONES = [
    { adresse: 'Kaloum, Conakry', frais: 45000 },
    { adresse: 'Dixinn, Conakry', frais: 50000 },
    { adresse: 'Ratoma, Conakry', frais: 55000 },
    { adresse: 'Matam, Conakry', frais: 60000 },
];

async function seed() {
    try {
        await sequelize.authenticate();
        const client = await User.findOne({ where: { email: 'client@test.com' } });
        if (!client) {
            console.error('❌ client@test.com introuvable — lancez npm run seed:accounts');
            process.exit(1);
        }

        let created = 0;
        for (const zone of ZONES) {
            const exists = await Order.findOne({
                where: {
                    utilisateur_id: client.id,
                    adresse_livraison: zone.adresse,
                    statut_livraison: 'pret',
                },
            });
            if (exists) continue;

            await Order.create({
                utilisateur_id: client.id,
                total_ttc: 150000 + zone.frais,
                frais_port: zone.frais,
                statut: 'payé',
                statut_livraison: 'pret',
                type_livraison: 'standard',
                nom_destinataire: client.nom_complet,
                telephone_livraison: client.telephone || '620000000',
                adresse_livraison: zone.adresse,
            });
            created++;
        }

        const available = await Order.count({ where: { statut_livraison: 'pret' } });
        console.log(`✅ ${created} commande(s) créée(s). Total disponibles : ${available}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
}

seed();
