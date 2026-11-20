// Génère un portefeuille dédié au module blockchain (cahier des charges
// 3.16), à usage Polygon Amoy (testnet) exclusivement. À exécuter une seule
// fois : `node scripts/generate-blockchain-wallet.js`.
const { ethers } = require('ethers');

const wallet = ethers.Wallet.createRandom();

console.log('\n🔐 Nouveau portefeuille Polygon Amoy (testnet) généré.\n');
console.log('Adresse publique (à financer via le robinet Amoy) :');
console.log('  ' + wallet.address);
console.log('\nClé privée (SECRÈTE — à mettre uniquement dans backend/.env, jamais commitée) :');
console.log('  ' + wallet.privateKey);
console.log('\nÉtapes suivantes :');
console.log('  1. Ajouter dans backend/.env : BLOCKCHAIN_PRIVATE_KEY=' + wallet.privateKey);
console.log('  2. Financer l\'adresse ci-dessus en MATIC de test : https://faucet.polygon.technology (sélectionner "Amoy")');
console.log('  3. Vérifier la configuration : node scripts/check-blockchain-wallet.js');
console.log('\n⚠️  Ce portefeuille est réservé au testnet Amoy. Ne jamais y envoyer de fonds réels (mainnet).\n');
