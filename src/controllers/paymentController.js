const { Transaction, Wallet, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

const paymentController = {
    // 1. Initier un dépôt (Simulation Orange Money / Wave)
    initiateDeposit: async (req, res, next) => {
        try {
            const { montant, moyen_paiement } = req.body;
            const user_id = req.user.id;

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
                metadata: { moyen_paiement }
            });

            // Simulation d'une URL de paiement
            // Dans un vrai cas, on appellerait l'API de PayExpresse/CinetPay ici
            res.status(201).json({
                message: "Transaction initiée",
                payment_url: `https://mock-payment-gateway.com/pay/${transaction.id}`,
                transaction_id: transaction.id
            });
        } catch (error) {
            next(error);
        }
    },

    // 2. Webhook de confirmation (Appelé par l'agrégateur)
    handleWebhook: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { transaction_id, status } = req.body; // Données envoyées par l'agrégateur

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
    }
};

module.exports = paymentController;
