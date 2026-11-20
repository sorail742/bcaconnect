// Vérifie la configuration et le solde du portefeuille Polygon Amoy
// (cahier des charges 3.16). À exécuter après avoir financé l'adresse via
// le robinet public : `node scripts/check-blockchain-wallet.js`.
require('dotenv').config();
const { ethers } = require('ethers');
const blockchainConfig = require('../src/config/blockchain');

(async () => {
    if (!blockchainConfig.isConfigured()) {
        console.log('❌ BLOCKCHAIN_PRIVATE_KEY non défini (ou BLOCKCHAIN_ENABLED=false) dans backend/.env');
        process.exit(1);
    }

    const wallet = blockchainConfig.getWallet();
    const provider = blockchainConfig.getProvider();

    try {
        const [balance, network] = await Promise.all([
            provider.getBalance(wallet.address),
            provider.getNetwork(),
        ]);

        console.log(`Réseau     : ${network.name || 'amoy'} (chainId ${network.chainId})`);
        console.log(`Adresse    : ${wallet.address}`);
        console.log(`Solde      : ${ethers.formatEther(balance)} MATIC`);

        if (balance === 0n) {
            console.log('\n⚠️  Solde nul — financer via https://faucet.polygon.technology (réseau "Amoy") avant utilisation.');
            process.exit(1);
        }

        console.log('\n✅ Portefeuille configuré et financé — module blockchain opérationnel.');
    } catch (err) {
        console.error('❌ Impossible de contacter le réseau Amoy :', err.message);
        process.exit(1);
    }
})();
