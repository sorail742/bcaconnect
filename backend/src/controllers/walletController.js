const { Wallet, Transaction } = require('../models');

const walletController = {
    getMyWallet: async (req, res, next) => {
        try {
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
                // Créer un portefeuille si inexistant
                const newWallet = await Wallet.create({ user_id: req.user.id });
                return res.json(newWallet);
            }

            res.json(wallet);
        } catch (error) {
            next(error);
        }
    },

    getTransactions: async (req, res, next) => {
        try {
            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) return res.json([]);

            const transactions = await Transaction.findAll({
                where: { portefeuille_id: wallet.id },
                order: [['createdAt', 'DESC']]
            });
            res.json(transactions);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = walletController;
