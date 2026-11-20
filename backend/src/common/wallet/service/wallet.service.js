const crypto = require('crypto');
const { sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');
const walletRepository = require('../repository/wallet.repository');
const transactionService = require('../../transactions/service/transaction.service');
const platformRevenueService = require('../../platform-revenue/service/platform-revenue.service');

const round2 = (n) => Math.round(n * 100) / 100;

const walletService = {
    async getMyWallet(userId) {
        const wallet = await walletRepository.findWithRecentTransactions(userId, 10);

        if (!wallet) {
            const newWallet = await walletRepository.create({ user_id: userId });
            const plain = newWallet.toJSON();
            plain.withdrawal_fee_rate = platformRevenueService.WITHDRAWAL_FEE_RATE;
            return plain;
        }

        const plain = wallet.toJSON();
        plain.withdrawal_fee_rate = platformRevenueService.WITHDRAWAL_FEE_RATE;
        return plain;
    },

    async getTransactions(userId, { page = 1, limit = 20 } = {}) {
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const wallet = await walletRepository.findByUserId(userId);
        if (!wallet) return { total: 0, pages: 0, currentPage: 1, transactions: [] };

        const { count, rows: transactions } = await transactionService.findAndCountByWalletId(wallet.id, {
            limit: parseInt(limit),
            offset,
        });

        return {
            total: count,
            pages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            transactions,
        };
    },

    async getAllTransactions({ page = 1, limit = 20, search = '' } = {}) {
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: transactions } = await transactionService.findAndCountAllWithWalletUser({
            search,
            limit: parseInt(limit),
            offset,
        });

        return {
            total: count,
            pages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            transactions,
        };
    },

    // Utilisée par user.service (création admin) et authController (register/googleLogin).
    async createWalletForUser(userId, { transaction } = {}) {
        return walletRepository.create({ user_id: userId }, { transaction });
    },

    // Charger son portefeuille
    async recharge(userId, { montant, mode_paiement, reference_externe }) {
        const t = await sequelize.transaction();
        try {
            if (!montant || isNaN(montant) || Number(montant) <= 0 || Number(montant) > 10000000000) {
                await t.rollback();
                throw new AppError('Montant invalide. Le montant doit être compris entre 1 et 10,000,000,000 GNF.', 400);
            }

            if (reference_externe) {
                const existingTx = await transactionService.findExistingByReference(reference_externe, { transaction: t });
                if (existingTx) {
                    await t.rollback();
                    return { message: 'La recharge a déjà été traitée.', transaction: existingTx };
                }
            }

            const wallet = await walletRepository.findByUserIdForUpdate(userId, t);

            if (!wallet) {
                await t.rollback();
                throw new AppError('Portefeuille non trouvé.', 404);
            }

            const numericMontant = round2(Number(montant));
            const nouveauSolde = round2(Number(wallet.solde_virtuel) + numericMontant);

            wallet.solde_virtuel = nouveauSolde;
            await walletRepository.save(wallet, { transaction: t });

            const tx = await transactionService.create({
                portefeuille_id: wallet.id,
                type_transaction: 'depot',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: reference_externe || `RECH-${crypto.randomUUID()}`,
                metadata: { mode_paiement, source: 'user_recharge' }
            }, { transaction: t });

            await t.commit();
            return { message: 'Recharge réussie avec succès', solde: nouveauSolde, transaction: tx };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    // Transfert entre utilisateurs (ex: Client -> Vendeur)
    async transfer(userId, body, io) {
        const t = await sequelize.transaction();
        try {
            const destinataireId = body.destinataire_id || body.destinataireId || body.recipientId;
            const montant = body.montant || body.amount;
            const motif = body.motif || body.description;
            const reference_externe = body.reference_externe;

            if (!montant || isNaN(montant) || Number(montant) <= 0 || Number(montant) > 10000000000) {
                await t.rollback();
                throw new AppError('Montant invalide. Le montant spécifié doit être compris entre 1 et 10,000,000,000 GNF.', 400);
            }
            if (String(userId) === String(destinataireId)) {
                await t.rollback();
                throw new AppError("Opération frauduleuse : le destinataire est identique à l'expéditeur.", 400);
            }

            if (reference_externe) {
                const existingTx = await transactionService.findExistingByReference(reference_externe, { transaction: t });
                if (existingTx) {
                    await t.rollback();
                    return { message: 'Ce transfert a déjà été traité avec succès.', transaction: existingTx };
                }
            }

            const walletsToLock = [userId, destinataireId].sort();
            await walletRepository.findByUserIdsForUpdate(walletsToLock, t);

            const sourceWallet = await walletRepository.findByUserId(userId, { transaction: t });
            const destWallet = await walletRepository.findByUserId(destinataireId, { transaction: t });

            if (!sourceWallet || !destWallet) {
                await t.rollback();
                throw new AppError("L'un des portefeuilles est introuvable.", 404);
            }

            const numericMontant = round2(Number(montant));
            const soldeSource = round2(Number(sourceWallet.solde_virtuel));

            if (soldeSource < numericMontant) {
                await t.rollback();
                throw new AppError('Fonds insuffisants pour exécuter ce transfert.', 400);
            }

            sourceWallet.solde_virtuel = round2(soldeSource - numericMontant);
            await walletRepository.save(sourceWallet, { transaction: t });

            destWallet.solde_virtuel = round2(Number(destWallet.solde_virtuel) + numericMontant);
            await walletRepository.save(destWallet, { transaction: t });

            const refBase = reference_externe || `TRF-${crypto.randomUUID()}`;

            const txDebit = await transactionService.create({
                portefeuille_id: sourceWallet.id,
                type_transaction: 'retrait',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: `${refBase}-DEBIT`,
                metadata: { type: 'transfert', destinataireId, motif }
            }, { transaction: t });

            const txCredit = await transactionService.create({
                portefeuille_id: destWallet.id,
                type_transaction: 'depot',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: `${refBase}-CREDIT`,
                metadata: { type: 'transfert', expediteurId: userId, motif }
            }, { transaction: t });

            await t.commit();

            if (io) {
                io.to(String(destinataireId)).emit('notification_received', {
                    type: 'wallet',
                    subtype: 'credit',
                    message: `Vous avez reçu un transfert de ${numericMontant.toLocaleString()} GNF`,
                    amount: numericMontant,
                    transactionId: txCredit.id
                });
                io.to(String(destinataireId)).emit('wallet_updated', { type: 'credit', amount: numericMontant });
            }

            return { message: 'Transfert sécurisé effectué avec succès.', transaction: txDebit };
        } catch (error) {
            if (!t.finished) await t.rollback();
            logger.error('Erreur Critique Transfert Wallet:', error);
            throw error;
        }
    },

    // ─── Retrait vers Mobile Money / banque ────────────────────────────────────
    // Il n'existe pas d'API de décaissement automatique vérifiée pour ce fournisseur
    // de paiement : le montant demandé est débité immédiatement (pour verrouiller le
    // solde et empêcher toute double dépense) et la demande passe en file d'attente
    // admin, qui envoie réellement l'argent puis clôture la demande manuellement.
    async requestWithdrawal(userId, { montant, destination_phone, methode }) {
        const t = await sequelize.transaction();
        try {
            const numericMontant = round2(Number(montant));

            if (!montant || isNaN(montant) || numericMontant <= 0 || numericMontant > 10000000000) {
                await t.rollback();
                throw new AppError('Montant invalide. Le montant doit être compris entre 1 et 10,000,000,000 GNF.', 400);
            }
            if (!destination_phone || !destination_phone.trim()) {
                await t.rollback();
                throw new AppError('Le numéro de destination (Mobile Money) est requis.', 400);
            }

            const wallet = await walletRepository.findByUserIdForUpdate(userId, t);
            if (!wallet) {
                await t.rollback();
                throw new AppError('Portefeuille non trouvé.', 404);
            }

            const soldeActuel = round2(Number(wallet.solde_virtuel));
            if (soldeActuel < numericMontant) {
                await t.rollback();
                throw new AppError('Solde insuffisant pour ce retrait.', 400);
            }

            const frais = round2(numericMontant * platformRevenueService.WITHDRAWAL_FEE_RATE);
            const montantNet = round2(numericMontant - frais);

            wallet.solde_virtuel = round2(soldeActuel - numericMontant);
            await walletRepository.save(wallet, { transaction: t });

            const tx = await transactionService.create({
                portefeuille_id: wallet.id,
                type_transaction: 'retrait',
                montant: numericMontant,
                statut: 'en_attente',
                reference_externe: `RET-${crypto.randomUUID()}`,
                metadata: {
                    type: 'withdrawal_request',
                    destination_phone: destination_phone.trim(),
                    methode: methode || 'mobile_money',
                    frais,
                    montant_net: montantNet,
                    taux_frais: platformRevenueService.WITHDRAWAL_FEE_RATE,
                },
            }, { transaction: t });

            await t.commit();
            return {
                message: `Demande de retrait enregistrée. ${montantNet.toLocaleString('fr-FR')} GNF vous seront envoyés après validation par l'administration.`,
                transaction: tx,
            };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    // Admin/Banque : file d'attente des demandes de retrait en attente.
    async getPendingWithdrawals() {
        return transactionService.findPendingWithdrawals();
    },

    // Admin/Banque : approuver (l'argent a été réellement envoyé hors plateforme) ou
    // rejeter (remboursement intégral) une demande de retrait.
    async processWithdrawal(txId, { action, notes_admin }, adminUserId) {
        const t = await sequelize.transaction();
        try {
            if (!['approve', 'reject'].includes(action)) {
                await t.rollback();
                throw new AppError("Action invalide : 'approve' ou 'reject' attendu.", 400);
            }

            const tx = await transactionService.findByIdForUpdate(txId, t, { type_transaction: 'retrait', statut: 'en_attente' });
            if (!tx) {
                await t.rollback();
                throw new AppError('Demande de retrait introuvable ou déjà traitée.', 404);
            }

            const wallet = await walletRepository.findByIdForUpdate(tx.portefeuille_id, t);
            if (!wallet) {
                await t.rollback();
                throw new AppError('Portefeuille associé introuvable.', 404);
            }

            if (action === 'reject') {
                wallet.solde_virtuel = round2(Number(wallet.solde_virtuel) + Number(tx.montant));
                await walletRepository.save(wallet, { transaction: t });

                tx.statut = 'rejete';
                tx.metadata = { ...tx.metadata, notes_admin: notes_admin || 'Retrait refusé.' };
                await transactionService.save(tx, { transaction: t });

                await t.commit();
                return { message: 'Retrait refusé et solde restitué au client.', transaction: tx };
            }

            // Approbation : les frais deviennent un revenu plateforme réel. Le montant
            // net a déjà été envoyé hors plateforme par l'administration à ce stade.
            const frais = Number(tx.metadata?.frais || 0);
            if (frais > 0) {
                await platformRevenueService.creditPlatformWallet(frais, {
                    commande_id: null,
                    type: 'frais_retrait',
                    reference_prefix: 'WDREV',
                    metadata: { transaction_id: tx.id, user_id: wallet.user_id },
                }, t);
            }

            tx.statut = 'complete';
            tx.metadata = { ...tx.metadata, notes_admin: notes_admin || null, traite_par: adminUserId };
            await transactionService.save(tx, { transaction: t });

            await t.commit();
            return { message: 'Retrait validé.', transaction: tx };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    // Traite les données déjà authentifiées (signature HMAC vérifiée par le contrôleur)
    // d'un webhook de recharge externe.
    async processRechargeWebhook({ userId, montant, transactionId }) {
        const t = await sequelize.transaction();
        try {
            const existingTx = await transactionService.findExistingByReference(transactionId, { transaction: t });
            if (existingTx) {
                await t.rollback();
                return { duplicate: true };
            }

            const wallet = await walletRepository.findByUserIdForUpdate(userId, t);
            if (!wallet) {
                await t.rollback();
                return { walletFound: false };
            }

            const numericMontant = round2(Number(montant));
            wallet.solde_virtuel = round2(Number(wallet.solde_virtuel) + numericMontant);
            await walletRepository.save(wallet, { transaction: t });

            await transactionService.create({
                portefeuille_id: wallet.id,
                type_transaction: 'depot',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: transactionId,
                metadata: { source: 'webhook_gateway' }
            }, { transaction: t });

            await t.commit();
            return { walletFound: true };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },
};

module.exports = walletService;
