const { Wallet, Transaction, User, sequelize } = require('../models');
const crypto = require('crypto');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const walletController = {
    getMyWallet: catchAsync(async (req, res) => {
        const wallet = await Wallet.findOne({
            where: { user_id: req.user.id },
            include: [{
                model: Transaction,
                as: 'transactions',
                limit: 10,
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!wallet) {
            const newWallet = await Wallet.create({ user_id: req.user.id });
            return res.json(newWallet);
        }

        res.json(wallet);
    }),

    getTransactions: catchAsync(async (req, res) => {
            const { page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) return res.json({ total: 0, pages: 0, currentPage: 1, transactions: [] });

            const { count, rows: transactions } = await Transaction.findAndCountAll({
                where: { portefeuille_id: wallet.id },
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset
            });

            res.json({
                total: count,
                pages: Math.ceil(count / parseInt(limit)),
                currentPage: parseInt(page),
                transactions
            });
    }),

    getAllTransactions: catchAsync(async (req, res) => {
            const { page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: transactions } = await Transaction.findAndCountAll({
                include: [{
                    model: Wallet,
                    include: [{ model: User, attributes: ['nom_complet', 'role', 'email'] }]
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset
            });

            res.json({
                total: count,
                pages: Math.ceil(count / parseInt(limit)),
                currentPage: parseInt(page),
                transactions
            });
    }),

    // Charger son portefeuille
    recharge: catchAsync(async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { montant, mode_paiement, reference_externe } = req.body;

            if (!montant || isNaN(montant) || Number(montant) <= 0 || Number(montant) > 10000000000) {
                await t.rollback();
                return next(new AppError('Montant invalide. Le montant doit être compris entre 1 et 10,000,000,000 GNF.', 400));
            }

            if (reference_externe) {
                const existingTx = await Transaction.findOne({ where: { reference_externe }, transaction: t });
                if (existingTx) {
                    await t.rollback();
                    return res.status(200).json({ message: 'La recharge a déjà été traitée.', transaction: existingTx });
                }
            }

            const wallet = await Wallet.findOne({
                where: { user_id: req.user.id },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!wallet) {
                await t.rollback();
                return next(new AppError('Portefeuille non trouvé.', 404));
            }

            const numericMontant = Math.round(Number(montant) * 100) / 100;
            const nouveauSolde = Math.round((Number(wallet.solde_virtuel) + numericMontant) * 100) / 100;

            wallet.solde_virtuel = nouveauSolde;
            await wallet.save({ transaction: t });

            const tx = await Transaction.create({
                portefeuille_id: wallet.id,
                type_transaction: 'depot',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: reference_externe || `RECH-${crypto.randomUUID()}`,
                metadata: { mode_paiement, source: 'user_recharge' }
            }, { transaction: t });

            await t.commit();
            res.json({ message: 'Recharge réussie avec succès', solde: nouveauSolde, transaction: tx });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }),

    // Transfert entre utilisateurs (ex: Client -> Vendeur)
    transfer: catchAsync(async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const destinataireId = req.body.destinataire_id || req.body.destinataireId || req.body.recipientId;
            const montant = req.body.montant || req.body.amount;
            const motif = req.body.motif || req.body.description;
            const reference_externe = req.body.reference_externe;

            if (!montant || isNaN(montant) || Number(montant) <= 0 || Number(montant) > 10000000000) {
                await t.rollback();
                return next(new AppError('Montant invalide. Le montant spécifié doit être compris entre 1 et 10,000,000,000 GNF.', 400));
            }
            if (String(req.user.id) === String(destinataireId)) {
                await t.rollback();
                return next(new AppError("Opération frauduleuse : le destinataire est identique à l'expéditeur.", 400));
            }

            if (reference_externe) {
                const existingTx = await Transaction.findOne({ where: { reference_externe }, transaction: t });
                if (existingTx) {
                    await t.rollback();
                    return res.status(200).json({ message: 'Ce transfert a déjà été traité avec succès.', transaction: existingTx });
                }
            }

            const walletsToLock = [req.user.id, destinataireId].sort();

            await Wallet.findAll({
                where: { user_id: walletsToLock },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            const sourceWallet = await Wallet.findOne({ where: { user_id: req.user.id }, transaction: t });
            const destWallet = await Wallet.findOne({ where: { user_id: destinataireId }, transaction: t });

            if (!sourceWallet || !destWallet) {
                await t.rollback();
                return next(new AppError("L'un des portefeuilles est introuvable.", 404));
            }

            const numericMontant = Math.round(Number(montant) * 100) / 100;
            const soldeSource = Math.round(Number(sourceWallet.solde_virtuel) * 100) / 100;

            if (soldeSource < numericMontant) {
                await t.rollback();
                return next(new AppError('Fonds insuffisants pour exécuter ce transfert.', 400));
            }

            sourceWallet.solde_virtuel = Math.round((soldeSource - numericMontant) * 100) / 100;
            await sourceWallet.save({ transaction: t });

            destWallet.solde_virtuel = Math.round((Number(destWallet.solde_virtuel) + numericMontant) * 100) / 100;
            await destWallet.save({ transaction: t });

            const refBase = reference_externe || `TRF-${crypto.randomUUID()}`;

            const txDebit = await Transaction.create({
                portefeuille_id: sourceWallet.id,
                type_transaction: 'retrait',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: `${refBase}-DEBIT`,
                metadata: { type: 'transfert', destinataireId, motif }
            }, { transaction: t });

            const txCredit = await Transaction.create({
                portefeuille_id: destWallet.id,
                type_transaction: 'depot',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: `${refBase}-CREDIT`,
                metadata: { type: 'transfert', expediteurId: req.user.id, motif }
            }, { transaction: t });

            await t.commit();
            res.json({ message: 'Transfert sécurisé effectué avec succès.', transaction: txDebit });

            const io = req.app.get('socketio');
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
        } catch (error) {
            await t.rollback();
            logger.error('Erreur Critique Transfert Wallet:', error);
            next(error);
        }
    }),

    // 🛡️ SÉCURITÉ FINTECH : Traitement d'injection d'argent via Webhook
    rechargeWebhook: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            // 1. Détection Anti-Spoofing (Signature HMAC)
            const signature = req.headers['x-bca-signature'];
            const webhookSecret = process.env.WEBHOOK_SECRET || 'bca-webhook-secret-dev';
            
            if (!signature) {
                await t.rollback();
                return res.status(401).json({ message: 'Signature Webhook manquante.' });
            }

            const expectedSignature = crypto.createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (signature !== expectedSignature) {
                await t.rollback();
                logger.warn('Tentative de falsification de Webhook bloquée.', { ip: req.ip });
                return res.status(403).json({ message: 'Signature invalide.' });
            }

            // 2. Traitement des datas certifiées du Payload
            const { user_id, montant, transaction_id, statut } = req.body;
            
            // Ne traiter que les Succès
            if (statut !== 'SUCCESS') {
                await t.rollback();
                return res.status(200).send('Ignoré: Statut non complété.');
            }

            // 3. Idempotence Absolue
            const existingTx = await Transaction.findOne({ where: { reference_externe: transaction_id }, transaction: t });
            if (existingTx) {
                await t.rollback();
                return res.status(200).send('Webhook déjà traité.');
            }

            // 4. Verrouillage DB
            const wallet = await Wallet.findOne({ 
                where: { user_id: user_id },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!wallet) {
                await t.rollback();
                return res.status(404).send('Portefeuille Introuvable.');
            }

            const numericMontant = Math.round(Number(montant) * 100) / 100;
            wallet.solde_virtuel = Math.round((Number(wallet.solde_virtuel) + numericMontant) * 100) / 100;
            await wallet.save({ transaction: t });

            await Transaction.create({
                portefeuille_id: wallet.id,
                type_transaction: 'depot',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: transaction_id,
                metadata: { source: 'webhook_gateway' }
            }, { transaction: t });

            await t.commit();
            res.status(200).send('Webhook processé et solde actualisé.');

        } catch (error) {
            await t.rollback();
            logger.error('Erreur Critique Webhook:', error);
            res.status(500).send('Internal Error');
        }
    }
};

module.exports = walletController;
