const { Transaction, Wallet, Notification, sequelize, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const paymentProviderService = require('../services/paymentProviderService');

const paymentController = {
    // Simulation de détection de fraude par IA
    checkFraudIA: async (user_id, montant) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            const wallet = await Wallet.findOne({ where: { user_id } });
            if (!wallet) return false;

            const recentTransactions = await Transaction.count({
                where: {
                    portefeuille_id: wallet.id,
                    createdAt: { [require('sequelize').Op.gte]: today },
                    statut: 'complete'
                }
            });

            // Seuil : montant > 5 000 000 GNF OU plus de 10 transactions dans la journée
            if (parseFloat(montant || 0) > 5000000 || recentTransactions > 10) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur checkFraudIA:', error);
            return false;
        }
    },

    // 1. Initier un dépôt (Simulation Orange Money / Wave)
    initiateDeposit: async (req, res, next) => {
        try {
            const montant = req.body.montant || req.body.amount;
            const moyen_paiement = req.body.moyen_paiement || req.body.method || 'unknown';
            const user_id = req.user.id;

            if (!montant) {
                return res.status(400).json({ message: "Le montant est requis." });
            }

            // Vérifier la fraude via IA
            const isSuspect = await paymentController.checkFraudIA(user_id, montant);

            // Récupérer le portefeuille de l'utilisateur
            const wallet = await Wallet.findOne({ where: { user_id } });
            if (!wallet) {
                return res.status(404).json({ message: "Portefeuille non trouvé." });
            }

            // Créer une transaction en attente
            const transaction = await Transaction.create({
                portefeuille_id: wallet.id,
                montant: parseFloat(montant),
                type_transaction: 'depot',
                statut: 'en_attente',
                reference_externe: `PAY-${uuidv4().slice(0, 8)}`,
                ia_suspect: isSuspect,
                metadata: { moyen_paiement }
            });

            const payment_url = await paymentProviderService.generatePaymentUrl(
                transaction.id, 
                parseFloat(montant), 
                "Recharge Portefeuille BCA", 
                req.user.telephone
            );

            res.status(201).json({
                message: isSuspect ? "Transaction initiée (Vérification de sécurité en cours)" : "Transaction initiée",
                payment_url: payment_url,
                transaction_id: transaction.id,
                is_suspect: isSuspect
            });
        } catch (error) {
            console.error('🔴 [PAYMENT ERROR] detail:', error);
            next(error);
        }
    },

    // 2. Webhook de confirmation (Appelé par l'agrégateur)
    handleWebhook: async (req, res, next) => {
        // Vérification de sécurité du Webhook
        if (!paymentProviderService.verifyWebhookSignature(req)) {
            console.error('🔴 [WEBHOOK] Signature invalide.');
            return res.status(403).json({ message: "Signature non autorisée." });
        }

        const t = await sequelize.transaction();
        try {
            // Selon le provider, les champs peuvent varier (ex: cpm_trans_id, cpm_result)
            // On gère un format générique + CinetPay
            const transaction_id = req.body.transaction_id || req.body.cpm_trans_id;
            const status = req.body.status || (req.body.cpm_result === '00' ? 'success' : 'failed');

            const transaction = await Transaction.findByPk(transaction_id, { transaction: t });

            if (!transaction || transaction.statut !== 'en_attente') {
                await t.rollback();
                return res.status(400).json({ message: "Transaction invalide ou déjà traitée." });
            }

            if (status === 'success') {
                transaction.statut = 'complete';
                await transaction.save({ transaction: t });

                // Créditer le portefeuille
                const wallet = await Wallet.findByPk(transaction.portefeuille_id, { transaction: t });
                wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + parseFloat(transaction.montant);
                await wallet.save({ transaction: t });

                await t.commit();

                // ⚡ NOTIFICATION TEMPS RÉEL
                const io = req.app.get('socketio');
                if (io) {
                    const paymentNotif = await Notification.create({
                        utilisateur_id: wallet.user_id,
                        titre: "Recharge réussie !",
                        message: `Votre portefeuille BCA a été crédité de <span class="font-black text-emerald-600">${parseFloat(transaction.montant).toLocaleString('fr-FR')} GNF</span>.`,
                        type: 'payment'
                    });
                    io.to(wallet.user_id).emit('notification_received', paymentNotif);
                }

                return res.json({ message: "Paiement confirmé et portefeuille crédité." });
            } else {
                transaction.statut = 'echoue';
                await transaction.save({ transaction: t });
                await t.commit();
                return res.json({ message: "Paiement échoué." });
            }
        } catch (error) {
            await t.rollback();
            next(error);
        }
    },

    // 3. Simuler un succès (Pour Phase 1 / Tests)
    captureSimulation: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { transaction_id } = req.body;
            const transaction = await Transaction.findByPk(transaction_id, { transaction: t });

            if (!transaction || transaction.statut !== 'en_attente') {
                await t.rollback();
                return res.status(400).json({ message: "Transaction invalide." });
            }

            transaction.statut = 'complete';
            await transaction.save({ transaction: t });

            const wallet = await Wallet.findByPk(transaction.portefeuille_id, { transaction: t });
            wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + parseFloat(transaction.montant);
            await wallet.save({ transaction: t });

            await t.commit();

            // ⚡ NOTIFICATION TEMPS RÉEL
            const io = req.app.get('socketio');
            if (io) {
                const simNotif = await Notification.create({
                    utilisateur_id: wallet.user_id,
                    titre: "Compte crédité (Sim)",
                    message: `Simulation réussie : <span class="font-black text-emerald-600">${parseFloat(transaction.montant).toLocaleString('fr-FR')} GNF</span> ajoutés.`,
                    type: 'payment'
                });
                io.to(wallet.user_id).emit('notification_received', simNotif);
            }

            res.json({ message: "Recharge réussie (Simulation)", solde: wallet.solde_virtuel });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }
};

module.exports = paymentController;
