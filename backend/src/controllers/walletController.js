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
    },

    getAllTransactions: async (req, res, next) => {
        try {
            const transactions = await Transaction.findAll({
                include: [{
                    model: Wallet,
                    include: [{ model: User, attributes: ['nom_complet', 'role', 'email'] }]
                }],
                order: [['createdAt', 'DESC']],
                limit: 100
            });
            res.json(transactions);
        } catch (error) {
            next(error);
        }
    },

    // Charger son portefeuille
    recharge: async (req, res, next) => {
        try {
            const { montant, mode_paiement } = req.body;
            if (!montant || montant <= 0) return res.status(400).json({ message: "Montant invalide." });

            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) return res.status(404).json({ message: "Portefeuille non trouvé." });

            const nouveauSolde = parseFloat(wallet.solde_virtuel) + parseFloat(montant);
            await wallet.update({ solde_virtuel: nouveauSolde });

            await Transaction.create({
                portefeuille_id: wallet.id,
                type: 'depot',
                montant,
                statut: 'complete',
                metadata: { mode_paiement, source: 'user_recharge' }
            });

            res.json({ message: "Recharge réussie", solde: nouveauSolde });
        } catch (error) {
            next(error);
        }
    },

    // Transfert entre utilisateurs (ex: Client -> Vendeur)
    transfer: async (req, res, next) => {
        try {
            const { destinataireId, montant, motif } = req.body;
            if (!montant || montant <= 0) return res.status(400).json({ message: "Montant invalide." });

            const sourceWallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            const destWallet = await Wallet.findOne({ where: { user_id: destinataireId } });

            if (!sourceWallet || !destWallet) return res.status(404).json({ message: "Un des portefeuilles est introuvable." });
            if (parseFloat(sourceWallet.solde_virtuel) < parseFloat(montant)) {
                return res.status(400).json({ message: "Fonds insuffisants." });
            }

            // Transaction atomique simplifiée
            await sourceWallet.decrement('solde_virtuel', { by: montant });
            await destWallet.increment('solde_virtuel', { by: montant });

            await Transaction.create({
                portefeuille_id: sourceWallet.id,
                type: 'retrait',
                montant,
                statut: 'complete',
                metadata: { type: 'transfert', destinataireId, motif }
            });

            await Transaction.create({
                portefeuille_id: destWallet.id,
                type: 'depot',
                montant,
                statut: 'complete',
                metadata: { type: 'transfert', expediteurId: req.user.id, motif }
            });

            res.json({ message: "Transfert effectué avec succès." });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = walletController;
