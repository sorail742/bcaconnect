/**
 * 🛠️ BCA Connect — Crédite le portefeuille du compte client@test.com pour
 * le rapport de charge k6 (cahier des charges 3.17).
 *
 * Le scénario "checkout" passe des commandes en paiement wallet pour rester
 * synchrone (pas de passerelle externe) — le solde de départ créé par
 * create-test-accounts.js (5 000 000 GNF) ne suffit pas pour des centaines
 * de commandes consécutives avec frais de port (~20-25k GNF/commande). Ce
 * script n'est utilisé QUE par .github/workflows/load-test.yml, jamais en
 * production.
 * Usage: node scripts/fund-load-test-wallet.js
 */

const { User, Wallet } = require('../src/models');

async function fundLoadTestWallet() {
    try {
        const user = await User.findOne({ where: { email: 'client@test.com' } });
        if (!user) {
            throw new Error("client@test.com introuvable — exécuter create-test-accounts.js d'abord.");
        }

        const wallet = await Wallet.findOne({ where: { user_id: user.id } });
        if (!wallet) {
            throw new Error('Portefeuille introuvable pour client@test.com.');
        }

        await wallet.update({ solde_virtuel: 500000000 });
        console.log(`✅ Portefeuille de client@test.com crédité à ${wallet.solde_virtuel} GNF pour le test de charge.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du crédit du portefeuille de charge :', error);
        process.exit(1);
    }
}

fundLoadTestWallet();
