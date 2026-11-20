const crypto = require('crypto');
const catchAsync = require('../../../utils/catchAsync');
const logger = require('../../../utils/logger');
const walletService = require('../service/wallet.service');

const walletController = {
    getMyWallet: catchAsync(async (req, res) => {
        const wallet = await walletService.getMyWallet(req.user.id);
        res.json(wallet);
    }),

    getTransactions: catchAsync(async (req, res) => {
        const result = await walletService.getTransactions(req.user.id, req.query);
        res.json(result);
    }),

    getAllTransactions: catchAsync(async (req, res) => {
        const result = await walletService.getAllTransactions(req.query);
        res.json(result);
    }),

    recharge: catchAsync(async (req, res) => {
        const result = await walletService.recharge(req.user.id, req.body);
        res.json(result);
    }),

    transfer: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await walletService.transfer(req.user.id, req.body, io);
        res.json(result);
    }),

    requestWithdrawal: catchAsync(async (req, res) => {
        const result = await walletService.requestWithdrawal(req.user.id, req.body);
        res.status(201).json(result);
    }),

    getPendingWithdrawals: catchAsync(async (req, res) => {
        const transactions = await walletService.getPendingWithdrawals();
        res.json(transactions);
    }),

    processWithdrawal: catchAsync(async (req, res) => {
        const result = await walletService.processWithdrawal(req.params.id, req.body, req.user.id);
        res.json(result);
    }),

    // 🛡️ SÉCURITÉ FINTECH : Traitement d'injection d'argent via Webhook
    rechargeWebhook: async (req, res) => {
        try {
            // 1. Détection Anti-Spoofing (Signature HMAC)
            const signature = req.headers['x-bca-signature'];
            const webhookSecret = process.env.WEBHOOK_SECRET || 'bca-webhook-secret-dev';

            if (!signature) {
                return res.status(401).json({ message: 'Signature Webhook manquante.' });
            }

            const expectedSignature = crypto.createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (signature !== expectedSignature) {
                logger.warn('Tentative de falsification de Webhook bloquée.', { ip: req.ip });
                return res.status(403).json({ message: 'Signature invalide.' });
            }

            // 2. Traitement des datas certifiées du Payload
            const { user_id, montant, transaction_id, statut } = req.body;

            // Ne traiter que les Succès
            if (statut !== 'SUCCESS') {
                return res.status(200).send('Ignoré: Statut non complété.');
            }

            const result = await walletService.processRechargeWebhook({ userId: user_id, montant, transactionId: transaction_id });

            if (result.duplicate) {
                return res.status(200).send('Webhook déjà traité.');
            }
            if (!result.walletFound) {
                return res.status(404).send('Portefeuille Introuvable.');
            }

            return res.status(200).send('Webhook processé et solde actualisé.');
        } catch (error) {
            logger.error('Erreur Critique Webhook:', error);
            return res.status(500).send('Internal Error');
        }
    }
};

module.exports = walletController;
