const { ethers } = require('ethers');

// Polygon Amoy — testnet officiel qui a remplacé Mumbai (déprécié) depuis
// avril 2024. Aucune configuration mainnet n'existe dans ce module : le
// chainId est figé ci-dessous et n'est jamais dérivé d'une variable
// d'environnement, pour qu'un opérateur ne puisse pas basculer ce module
// vers un réseau réel par erreur de configuration.
const AMOY_CHAIN_ID = 80002;
const DEFAULT_RPC_URL = 'https://rpc-amoy.polygon.technology';
const EXPLORER_BASE_URL = 'https://amoy.polygonscan.com/tx/';

let provider = null;
let wallet = null;

function getProvider() {
    if (!provider) {
        provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL || DEFAULT_RPC_URL, AMOY_CHAIN_ID);
    }
    return provider;
}

// Le module reste désactivé (503 côté service) tant qu'aucune clé n'est
// fournie — c'est l'état par défaut attendu avant que le portefeuille de
// test ne soit financé via le robinet public Amoy (cf. scripts/generate-
// blockchain-wallet.js).
function isConfigured() {
    return process.env.BLOCKCHAIN_ENABLED !== 'false' && Boolean(process.env.BLOCKCHAIN_PRIVATE_KEY);
}

function getWallet() {
    if (!isConfigured()) return null;
    if (!wallet) {
        wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, getProvider());
    }
    return wallet;
}

function explorerTxUrl(hash) {
    return `${EXPLORER_BASE_URL}${hash}`;
}

module.exports = { getProvider, getWallet, isConfigured, explorerTxUrl, AMOY_CHAIN_ID };
