/**
 * Crée des demandes de crédit en attente pour tester le workflow banque.
 * Usage: node scripts/seed-pending-credits.js
 */
const { User, Credit, sequelize } = require('../src/models');

const DEMOS = [
    { montant_principal: 2500000, duree_mois: 6, taux_interet: 8, motif: 'Achat équipement agricole', ia_score_solvabilite: 72 },
    { montant_principal: 5000000, duree_mois: 12, taux_interet: 10, motif: 'Stock marchandises boutique', ia_score_solvabilite: 58 },
    { montant_principal: 1200000, duree_mois: 3, taux_interet: 5, motif: 'Urgence trésorerie', ia_score_solvabilite: 81 },
];

async function seed() {
    try {
        await sequelize.authenticate();
        const client = await User.findOne({ where: { email: 'client@test.com' } });
        if (!client) {
            console.error('❌ Compte client@test.com introuvable. Lancez npm run seed:accounts');
            process.exit(1);
        }

        let created = 0;
        for (const demo of DEMOS) {
            const existing = await Credit.findOne({
                where: {
                    utilisateur_id: client.id,
                    montant_principal: demo.montant_principal,
                    statut: 'en_attente',
                },
            });
            if (existing) continue;

            await Credit.create({
                utilisateur_id: client.id,
                ...demo,
                statut: 'en_attente',
            });
            created++;
        }

        const total = await Credit.count({ where: { statut: 'en_attente' } });
        console.log(`✅ ${created} nouvelle(s) demande(s) créée(s). Total en attente : ${total}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur seed crédits:', err.message);
        process.exit(1);
    }
}

seed();
