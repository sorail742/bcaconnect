const { User } = require('../../../models');
const walletRepository = require('../../wallet/repository/wallet.repository');
const transactionService = require('../../transactions/service/transaction.service');

/**
 * Taux de commission plateforme prélevé sur chaque vente au moment où les fonds
 * sortent du séquestre vers le vendeur (livraison confirmée ou litige tranché en
 * sa faveur) — jamais au moment du paiement client, pour ne pas avoir à rembourser
 * une commission sur une commande finalement annulée/remboursée.
 * Configurable via .env, ex: PLATFORM_COMMISSION_RATE=0.05 (= 5%).
 */
const COMMISSION_RATE = (() => {
    const raw = parseFloat(process.env.PLATFORM_COMMISSION_RATE);
    return Number.isFinite(raw) && raw >= 0 && raw < 1 ? raw : 0.05;
})();

/**
 * Part des frais de livraison retenue par la plateforme à la confirmation de
 * livraison — le reste revient au transporteur. Configurable via .env, ex:
 * PLATFORM_DELIVERY_MARGIN_RATE=0.10 (= 10%).
 */
const DELIVERY_MARGIN_RATE = (() => {
    const raw = parseFloat(process.env.PLATFORM_DELIVERY_MARGIN_RATE);
    return Number.isFinite(raw) && raw >= 0 && raw < 1 ? raw : 0.10;
})();

/**
 * Taux de frais prélevé sur chaque retrait de portefeuille (mobile money / banque),
 * au profit de la plateforme. Configurable via .env, ex: PLATFORM_WITHDRAWAL_FEE_RATE=0.02.
 */
const WITHDRAWAL_FEE_RATE = (() => {
    const raw = parseFloat(process.env.PLATFORM_WITHDRAWAL_FEE_RATE);
    return Number.isFinite(raw) && raw >= 0 && raw < 1 ? raw : 0.02;
})();

let cachedPlatformUserId = null;

/**
 * Résout le compte propriétaire de la plateforme. Priorité à PLATFORM_ADMIN_EMAIL
 * (.env) si défini et existant, sinon le compte admin le plus ancien (le premier
 * créé). Mis en cache en mémoire process (l'id ne change pas en cours d'exécution).
 */
async function resolvePlatformUser(transaction) {
    if (cachedPlatformUserId) {
        const cached = await User.findByPk(cachedPlatformUserId, { transaction });
        if (cached) return cached;
        cachedPlatformUserId = null;
    }

    const email = process.env.PLATFORM_ADMIN_EMAIL;
    let user = null;
    if (email) {
        user = await User.findOne({ where: { email, role: 'admin' }, transaction });
    }
    if (!user) {
        user = await User.findOne({ where: { role: 'admin' }, order: [['createdAt', 'ASC']], transaction });
    }
    if (user) cachedPlatformUserId = user.id;
    return user;
}

/**
 * Résout le compte qui doit recevoir un remboursement de crédit : priorité à un
 * compte `banque` (partenaire financier dédié) s'il en existe un, sinon repli sur
 * le compte plateforme (`resolvePlatformUser`). Même logique qu'avant, mais
 * centralisée pour partager le crédit de portefeuille avec un échec explicite.
 */
async function resolveBankOrAdminUser(transaction) {
    const bankUser = await User.findOne({ where: { role: 'banque' }, order: [['createdAt', 'ASC']], transaction });
    if (bankUser) return bankUser;
    return resolvePlatformUser(transaction);
}

/**
 * Crédite le portefeuille d'un utilisateur donné et journalise une Transaction.
 * Échoue explicitement (avec log) si l'utilisateur n'a pas de portefeuille, plutôt
 * que de faire disparaître l'argent silencieusement.
 */
async function creditUserWallet(userId, amount, { commande_id = null, type = 'depot', reference_prefix = 'CR', metadata = {} } = {}, transaction) {
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) return { credited: false, amount: 0, reason: 'invalid_amount' };

    const wallet = await walletRepository.findByUserIdForUpdate(userId, transaction);
    if (!wallet) {
        console.error('[platformRevenueService] Utilisateur sans portefeuille — crédit non effectué:', { userId, amount: value, type });
        return { credited: false, amount: 0, reason: 'no_wallet' };
    }

    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + value;
    await walletRepository.save(wallet, { transaction });

    await transactionService.create({
        portefeuille_id: wallet.id,
        commande_id,
        montant: value,
        type_transaction: type,
        statut: 'complete',
        reference_externe: `${reference_prefix}-${(commande_id || 'X').toString().slice(0, 8)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        metadata,
    }, { transaction });

    return { credited: true, amount: value, walletId: wallet.id, userId };
}

/**
 * Crédite le portefeuille de la plateforme d'un montant (commission, publicité, ...).
 * Si aucun compte admin n'existe, échoue "au profit du vendeur/utilisateur" plutôt
 * que de faire disparaître l'argent silencieusement — l'appelant doit alors ne PAS
 * prélever le montant correspondant (voir escrowService / adController).
 */
async function creditPlatformWallet(amount, opts, transaction) {
    const platformUser = await resolvePlatformUser(transaction);
    if (!platformUser) {
        console.error('[platformRevenueService] Aucun compte admin trouvé — montant non prélevé:', { amount, ...opts });
        return { credited: false, amount: 0, reason: 'no_platform_account' };
    }
    const result = await creditUserWallet(platformUser.id, amount, { reference_prefix: 'COM', type: 'commission_plateforme', ...opts }, transaction);
    return { ...result, platformUserId: platformUser.id };
}

module.exports = {
    COMMISSION_RATE,
    DELIVERY_MARGIN_RATE,
    WITHDRAWAL_FEE_RATE,
    resolvePlatformUser,
    resolveBankOrAdminUser,
    creditUserWallet,
    creditPlatformWallet,
};
