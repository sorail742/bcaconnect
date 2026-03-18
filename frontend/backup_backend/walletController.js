const { Wallet, Transaction } = require('../models');

const walletController = {
    getWallet: async (req, res, next) => {
        try {
            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) {
                return res.status(404).json({ message: "Portefeuille non trouvé." });
            }
            res.json(wallet);
        } catch (error) {
            next(error);
        }
    },

    getTransactions: async (req, res, next) => {
        try {
            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) {
                return res.status(404).json({ message: "Portefeuille non trouvé." });
            }

            const transactions = await Transaction.findAll({
                where: { portefeuille_id: wallet.id },
                order: [['createdAt', 'DESC']]
            });

            // Map standard labels for the frontend if needed
            const mappedTransactions = transactions.map(tx => ({
                id: tx.id,
                montant: tx.montant,
                type: tx.type_transaction && tx.type_transaction.includes('credit') ? 'crédit' : 'débit',
                statut: tx.statut === 'complete' ? 'complété' : (tx.statut === 'en_attente' ? 'en attente' : 'échoué'),
                description: tx.type_transaction === 'depot' ? 'Dépôt via Orange/MTN' : 
                            (tx.type_transaction === 'debit_achat' ? 'Achat sur BCA' : 
                            (tx.type_transaction.includes('remboursement') ? 'Remboursement commande' : 'Transaction')),
                createdAt: tx.createdAt
            }));

            res.json({ transactions: mappedTransactions });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = walletController;
