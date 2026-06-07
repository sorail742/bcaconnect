/**
 * Recharge les portefeuilles des comptes de test (démo / E2E)
 * Usage: node scripts/seed-recharge-wallets.js
 *        MONTANT=5000000 node scripts/seed-recharge-wallets.js
 */
require('dotenv').config();
const { User, Wallet, sequelize } = require('../src/models');

const DEFAULT_AMOUNT = parseInt(process.env.MONTANT, 10) || 5_000_000;

const TEST_EMAILS = [
    'client@test.com',
    'fournisseur@test.com',
    'transporteur@test.com',
    'banque@test.com',
    'technicien@test.com',
    'admin@test.com',
];

async function run() {
    try {
        await sequelize.authenticate();
        console.log(`\n💰 Recharge portefeuilles test → ${DEFAULT_AMOUNT.toLocaleString('fr-FR')} GNF\n`);

        let updated = 0;
        for (const email of TEST_EMAILS) {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                console.log(`  ⚠️  ${email} — compte introuvable (lancez npm run seed:accounts)`);
                continue;
            }

            const [wallet] = await Wallet.findOrCreate({
                where: { user_id: user.id },
                defaults: { solde_virtuel: DEFAULT_AMOUNT, solde_sequestre: 0 },
            });

            await wallet.update({ solde_virtuel: DEFAULT_AMOUNT });
            console.log(`  ✅ ${email} (${user.role}) → ${DEFAULT_AMOUNT.toLocaleString('fr-FR')} GNF`);
            updated++;
        }

        console.log(`\n✅ ${updated} portefeuille(s) rechargé(s).\n`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
}

run();
