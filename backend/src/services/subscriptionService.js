const { Wallet, Transaction } = require('../models');
const platformRevenueService = require('../common/platform-revenue/service/platform-revenue.service');

/** Prix mensuel de l'abonnement "Pro" boutique (GNF). Configurable via .env. */
const SUBSCRIPTION_PRICE = (() => {
    const raw = parseFloat(process.env.PLATFORM_SUBSCRIPTION_PRICE);
    return Number.isFinite(raw) && raw > 0 ? raw : 75000;
})();

/** Nombre de produits actifs autorisés pour une boutique en plan gratuit. */
const FREE_TIER_PRODUCT_LIMIT = (() => {
    const raw = parseInt(process.env.FREE_TIER_PRODUCT_LIMIT, 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 15;
})();

const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

const isPlanActive = (store) => (
    store.plan === 'pro' && !!store.plan_expire_le && new Date(store.plan_expire_le) > new Date()
);

/**
 * Fait expirer automatiquement le plan "pro" en base s'il est dépassé — vérifié à
 * chaque lecture de la boutique plutôt que via une tâche planifiée séparée.
 */
async function ensurePlanStatus(store, transaction) {
    if (store.plan === 'pro' && !isPlanActive(store)) {
        store.plan = 'gratuit';
        store.plan_expire_le = null;
        await store.save({ transaction });
    }
    return store;
}

/**
 * Abonne (ou renouvelle) une boutique au plan "pro" : débite le portefeuille du
 * propriétaire, crédite la plateforme, prolonge la date d'expiration (à partir de
 * l'expiration actuelle si l'abonnement est encore actif, sinon à partir de
 * maintenant). Vérifie qu'un compte plateforme existe AVANT tout débit, pour ne
 * jamais facturer un vendeur pour un paiement qui n'irait nulle part.
 */
async function subscribeStore(store, transaction) {
    const platformUser = await platformRevenueService.resolvePlatformUser(transaction);
    if (!platformUser) return { success: false, reason: 'no_platform_account' };

    const wallet = await Wallet.findOne({
        where: { user_id: store.proprietaire_id },
        transaction,
        lock: transaction?.LOCK?.UPDATE,
    });
    if (!wallet || parseFloat(wallet.solde_virtuel) < SUBSCRIPTION_PRICE) {
        return { success: false, reason: 'insufficient_balance' };
    }

    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) - SUBSCRIPTION_PRICE;
    await wallet.save({ transaction });

    const base = isPlanActive(store) ? new Date(store.plan_expire_le) : new Date();
    const newExpiry = new Date(base.getTime() + SUBSCRIPTION_DURATION_MS);

    store.plan = 'pro';
    store.plan_expire_le = newExpiry;
    await store.save({ transaction });

    await Transaction.create({
        portefeuille_id: wallet.id,
        montant: SUBSCRIPTION_PRICE,
        type_transaction: 'abonnement_boutique',
        statut: 'complete',
        reference_externe: `SUB-${store.id.slice(0, 8)}-${Date.now().toString(36)}`,
        metadata: { store_id: store.id, expire_le: newExpiry },
    }, { transaction });

    await platformRevenueService.creditUserWallet(platformUser.id, SUBSCRIPTION_PRICE, {
        type: 'abonnement_boutique',
        reference_prefix: 'SUBREV',
        metadata: { store_id: store.id, vendeur_id: store.proprietaire_id },
    }, transaction);

    return { success: true, expire_le: newExpiry };
}

module.exports = { SUBSCRIPTION_PRICE, FREE_TIER_PRODUCT_LIMIT, isPlanActive, ensurePlanStatus, subscribeStore };
