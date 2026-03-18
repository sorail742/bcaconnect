const { Transaction, Wallet, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

const paymentController = {
    // Simulation de détection de fraude par IA
    checkFraudIA: async (user_id, montant) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            const recentTransactions = await Transaction.count({
                where: {
                    created_at: { [require('sequelize').Op.gte]: today },
                    statut: 'complete'
                }
            });

            if (montant > 5000000 || recentTransactions > 3) {
                return true; // Suspect
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
            const { montant, moyen_paiement } = req.body;
            const user_id = req.user.id;

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
                montant,
                type_transaction: 'depot',
                statut: 'en_attente',
                reference_externe: `PAY-${uuidv4().slice(0, 8)}`,
                ia_suspect: isSuspect,
                metadata: { moyen_paiement }
            });

            res.status(201).json({
                message: isSuspect ? "Transaction initiée (Vérification de sécurité en cours)" : "Transaction initiée",
                payment_url: `https://mock-payment-gateway.com/pay/${transaction.id}`,
                transaction_id: transaction.id,
                is_suspect: isSuspect
            });
        } catch (error) {
            next(error);
        }
    },

    // 2. Webhook de confirmation (Appelé par l'agrégateur)
    handleWebhook: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { transaction_id, status } = req.body;

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
            res.json({ message: "Recharge réussie (Simulation)", solde: wallet.solde_virtuel });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }
};

module.exports = paymentController;
