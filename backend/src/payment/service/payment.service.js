const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../../models');
const AppError = require('../../utils/AppError');
const paymentProviderService = require('../../services/paymentProviderService');
const escrowService = require('../../common/escrow/service/escrow.service');
const { notifyCarriersOrderReady } = require('../../services/deliveryNotificationService');
const walletRepository = require('../../common/wallet/repository/wallet.repository');
const transactionService = require('../../common/transactions/service/transaction.service');
const userRepository = require('../../user/repository/user.repository');
const orderRepository = require('../../order/repository/order.repository');
const paymentRepository = require('../repository/payment.repository');

/**
 * Moteur de scoring anti-fraude (règles pondérées).
 * Retourne { suspect, score (0-100), reasons[] } plutôt qu'un simple booléen,
 * pour tracer *pourquoi* une transaction est signalée.
 *
 * Règles :
 *  - Montant élevé (seuils progressifs)
 *  - Vélocité : nombre de transactions sur la journée
 *  - Vélocité rapide : plusieurs transactions dans la dernière heure
 *  - Compte récent (moins de 24h) effectuant un gros dépôt
 *  - Cumul journalier dépassant un plafond
 */
const FRAUD_THRESHOLD = 50; // score >= 50 => suspect

const checkFraudIA = async (user_id, montant) => {
    const amount = parseFloat(montant || 0);
    const reasons = [];
    let score = 0;

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const wallet = await walletRepository.findByUserId(user_id);
    if (!wallet) {
        // Pas de portefeuille = première opération : neutre, on évalue le montant seul.
        if (amount > 5000000) { score += 40; reasons.push('Montant très élevé sur un compte sans portefeuille'); }
        return { suspect: score >= FRAUD_THRESHOLD, score, reasons };
    }

    // 1) Seuils de montant progressifs
    if (amount > 10000000) { score += 50; reasons.push('Montant exceptionnel (> 10M GNF)'); }
    else if (amount > 5000000) { score += 30; reasons.push('Montant élevé (> 5M GNF)'); }
    else if (amount > 2000000) { score += 15; reasons.push('Montant important (> 2M GNF)'); }

    // 2) Vélocité journalière
    const txToday = await transactionService.countByWalletSince(wallet.id, startOfDay, ['complete', 'en_attente']);
    if (txToday > 15) { score += 40; reasons.push(`Vélocité anormale : ${txToday} transactions aujourd'hui`); }
    else if (txToday > 8) { score += 20; reasons.push(`Vélocité élevée : ${txToday} transactions aujourd'hui`); }

    // 3) Rafale sur la dernière heure
    const txLastHour = await transactionService.countByWalletSince(wallet.id, oneHourAgo);
    if (txLastHour >= 5) { score += 30; reasons.push(`Rafale : ${txLastHour} transactions en 1h`); }

    // 4) Cumul journalier des montants
    const cumulToday = await transactionService.sumMontantByWalletSince(wallet.id, startOfDay, ['complete', 'en_attente']) || 0;
    if ((cumulToday + amount) > 20000000) { score += 25; reasons.push('Cumul journalier > 20M GNF'); }

    // 5) Compte récent réalisant une grosse opération
    try {
        const user = await userRepository.findByIdWithAttributes(user_id, ['created_at']);
        if (user && user.created_at) {
            const accountAgeH = (now - new Date(user.created_at)) / 36e5;
            if (accountAgeH < 24 && amount > 1000000) {
                score += 25;
                reasons.push('Compte créé il y a moins de 24h avec grosse transaction');
            }
        }
    } catch (_) { /* champ optionnel */ }

    return { suspect: score >= FRAUD_THRESHOLD, score: Math.min(100, score), reasons };
};

const resolveOrderId = (body) => body.order_id || body.commande_id;

const finalizeSuccessfulPayment = async (transaction, app, t) => {
    const orderId = transaction.commande_id || transaction.metadata?.commande_id;
    const isOrderPayment = transaction.metadata?.type === 'order_payment' || !!orderId;

    if (isOrderPayment && orderId) {
        const result = await escrowService.confirmOrderPayment(orderId, t);
        transaction.statut = 'complete';
        await transactionService.save(transaction, { transaction: t });

        const io = app.get('socketio');
        if (io && result.order) {
            const orderNotif = await paymentRepository.createNotification({
                utilisateur_id: result.order.utilisateur_id,
                titre: 'Paiement confirmé !',
                message: `Votre commande <span class="font-black text-primary">#${orderId.slice(0, 8)}</span> est payée. Le séquestre vendeur est activé.`,
                type: 'order'
            });
            io.to(result.order.utilisateur_id).emit('notification_received', orderNotif);
        }

        // Le vendeur avait déjà tout préparé pendant que le paiement était en attente :
        // la commande vient de passer 'pret', on prévient les transporteurs maintenant.
        if (result.carrierReady && result.order) {
            await notifyCarriersOrderReady(app, result.order).catch((e) => {
                console.warn('[payment] Notification transporteur:', e.message);
            });
        }

        return { kind: 'order', orderId, result };
    }

    transaction.statut = 'complete';
    await transactionService.save(transaction, { transaction: t });

    const wallet = await walletRepository.findByIdForUpdate(transaction.portefeuille_id, t);
    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + parseFloat(transaction.montant);
    await walletRepository.save(wallet, { transaction: t });

    const io = app.get('socketio');
    if (io) {
        const paymentNotif = await paymentRepository.createNotification({
            utilisateur_id: wallet.user_id,
            titre: 'Recharge réussie !',
            message: `Votre portefeuille BCA a été crédité de <span class="font-black text-emerald-600">${parseFloat(transaction.montant).toLocaleString('fr-FR')} GNF</span>.`,
            type: 'payment'
        });
        io.to(wallet.user_id).emit('notification_received', paymentNotif);
    }

    return { kind: 'wallet', wallet };
};

const paymentService = {
    async initiateDeposit(body, user) {
        const montant = body.montant || body.amount;
        const moyen_paiement = body.moyen_paiement || body.method || body.methode_paiement || 'mobile_money';
        const orderId = resolveOrderId(body);

        if (!montant || parseFloat(montant) <= 0) {
            throw new AppError('Le montant est requis et doit être positif.', 400);
        }

        const wallet = await walletRepository.findByUserId(user.id);
        if (!wallet) throw new AppError('Portefeuille non trouvé.', 404);

        let order = null;
        if (orderId) {
            order = await orderRepository.findByIdForUser(orderId, user.id);
            if (!order) throw new AppError('Commande introuvable.', 404);
            if (order.statut !== 'en_attente_paiement') {
                throw new AppError('Cette commande ne peut plus être payée.', 400);
            }
            if (Math.abs(parseFloat(montant) - parseFloat(order.total_ttc)) > 0.01) {
                throw new AppError('Le montant ne correspond pas au total de la commande.', 400);
            }
        }

        const fraud = await checkFraudIA(user.id, montant);
        const isSuspect = fraud.suspect;
        const paymentType = orderId ? 'order_payment' : 'wallet_deposit';

        const transaction = await transactionService.create({
            portefeuille_id: wallet.id,
            commande_id: orderId || null,
            montant: parseFloat(montant),
            type_transaction: orderId ? 'achat_produit' : 'depot',
            statut: 'en_attente',
            reference_externe: `PAY-${uuidv4().slice(0, 8)}`,
            ia_suspect: isSuspect,
            metadata: {
                moyen_paiement,
                provider: paymentProviderService.isConfigured() ? paymentProviderService.providerName() : 'simulation',
                type: paymentType,
                commande_id: orderId || undefined,
                fraud_score: fraud.score,
                fraud_reasons: fraud.reasons
            }
        });

        const description = orderId
            ? `Commande BCA #${orderId.slice(0, 8)}`
            : 'Recharge Portefeuille BCA';

        const returnPath = orderId
            ? `/payment/return?tx=${transaction.id}&type=order&order_id=${orderId}`
            : `/payment/return?tx=${transaction.id}&type=wallet`;

        const payment_url = await paymentProviderService.generatePaymentUrl(
            transaction.id,
            parseFloat(montant),
            description,
            user.telephone,
            {
                returnPath,
                moyenPaiement: moyen_paiement,
                metadata: { type: paymentType, commande_id: orderId || undefined },
                // Persiste la référence propre au provider (ex. pay_id LengoPay) pour
                // permettre à verifyTransactionStatus de re-vérifier le paiement plus tard.
                onProviderRef: async (providerRef) => {
                    transaction.metadata = { ...transaction.metadata, provider_ref: providerRef };
                    await transactionService.save(transaction);
                },
            },
        );

        return {
            message: isSuspect ? 'Transaction initiée (vérification de sécurité en cours)' : 'Transaction initiée',
            payment_url,
            transaction_id: transaction.id,
            order_id: orderId || null,
            is_suspect: isSuspect,
            fraud_score: fraud.score,
            provider: paymentProviderService.isConfigured() ? paymentProviderService.providerName() : 'simulation'
        };
    },

    async handleWebhook(body, query, app) {
        const t = await sequelize.transaction();
        try {
            const { transactionId: transaction_id, success } = paymentProviderService.parseWebhookStatus(body, query);

            const transaction = await transactionService.findByIdForUpdate(transaction_id, t);

            if (!transaction || transaction.statut !== 'en_attente') {
                await t.rollback();
                throw new AppError('Transaction invalide ou déjà traitée.', 400);
            }

            if (success) {
                if (paymentProviderService.isConfigured()) {
                    const verified = await paymentProviderService.verifyTransactionStatus(transaction_id);
                    const statusConfirmed = verified === 'ACCEPTED' || verified === 'SUCCESS';

                    // Providers sans signature de webhook vérifiable (ex. LengoPay) : on
                    // EXIGE une confirmation positive du statut avant de finaliser quoi que
                    // ce soit — sinon un webhook forgé pourrait créditer un portefeuille.
                    // Providers avec webhook déjà authentifié (ex. CinetPay/HMAC) : on ne
                    // rejette que si le statut contredit explicitement le webhook.
                    const shouldReject = paymentProviderService.requiresStatusConfirmation()
                        ? !statusConfirmed
                        : (verified && !statusConfirmed);

                    if (shouldReject) {
                        await t.rollback();
                        throw new AppError('Statut de paiement non confirmé par le provider.', 400);
                    }
                }

                await finalizeSuccessfulPayment(transaction, app, t);
                await t.commit();
                return { message: 'Paiement confirmé.' };
            }

            transaction.statut = 'echoue';
            await transactionService.save(transaction, { transaction: t });

            const io = app.get('socketio');
            if (io) {
                const wallet = await walletRepository.findById(transaction.portefeuille_id, { transaction: t });
                if (wallet) {
                    const failNotif = await paymentRepository.createNotification({
                        utilisateur_id: wallet.user_id,
                        titre: 'Paiement échoué',
                        message: `Votre tentative de paiement de ${parseFloat(transaction.montant).toLocaleString('fr-FR')} GNF a échoué. Veuillez réessayer.`,
                        type: 'payment'
                    }, { transaction: t });
                    io.to(wallet.user_id).emit('notification_received', failNotif);
                }
            }

            await t.commit();
            return { message: 'Paiement échoué.' };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    async getPaymentStatus(transactionId, user) {
        const transaction = await transactionService.findByIdWithWallet(transactionId);

        if (!transaction) {
            throw new AppError('Transaction introuvable.', 404);
        }

        const wallet = transaction.Wallet || await walletRepository.findById(transaction.portefeuille_id);
        if (!wallet || wallet.user_id !== user.id) {
            throw new AppError('Accès non autorisé à cette transaction.', 403);
        }

        let providerStatus = null;
        if (transaction.statut === 'en_attente' && paymentProviderService.isConfigured()) {
            providerStatus = await paymentProviderService.verifyTransactionStatus(transactionId);
        }

        return {
            transaction_id: transaction.id,
            statut: transaction.statut,
            montant: parseFloat(transaction.montant),
            order_id: transaction.commande_id || transaction.metadata?.commande_id || null,
            provider: transaction.metadata?.provider || 'simulation',
            provider_status: providerStatus,
            type: transaction.metadata?.type || null,
        };
    },

    async captureSimulation(body, app) {
        if (process.env.NODE_ENV === 'production') {
            throw new AppError('Simulation désactivée en production.', 403);
        }
        if (process.env.PAYMENT_MODE === 'live') {
            throw new AppError('Mode paiement live actif — simulation désactivée.', 403);
        }

        const t = await sequelize.transaction();
        try {
            const { transaction_id } = body;
            const transaction = await transactionService.findByIdForUpdate(transaction_id, t);

            if (!transaction || transaction.statut !== 'en_attente') {
                await t.rollback();
                throw new AppError('Transaction invalide.', 400);
            }

            const outcome = await finalizeSuccessfulPayment(transaction, app, t);
            await t.commit();

            if (outcome.kind === 'order') {
                return {
                    message: 'Paiement commande confirmé (Simulation)',
                    order_id: outcome.orderId,
                    statut: 'payé'
                };
            }

            return { message: 'Recharge réussie (Simulation)', solde: outcome.wallet.solde_virtuel };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },
};

module.exports = paymentService;
