const { Wallet, Transaction, User, sequelize } = require('../models');

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
        const t = await sequelize.transaction();
        try {
            const { montant, mode_paiement, reference_externe } = req.body;
            
            // Validation Métier Stricte : Montant valide et > 0
            if (!montant || isNaN(montant) || Number(montant) <= 0) {
                await t.rollback();
                return res.status(400).json({ message: "Montant invalide. Le montant doit être supérieur à 0." });
            }

            // Vérification de l'idempotence
            if (reference_externe) {
                const existingTx = await Transaction.findOne({ where: { reference_externe }, transaction: t });
                if (existingTx) {
                    await t.rollback();
                    return res.status(200).json({ message: "La recharge a déjà été traitée.", transaction: existingTx });
                }
            }

            // Lecture sécurisée avec VERROU (Évite les Race Conditions)
            const wallet = await Wallet.findOne({ 
                where: { user_id: req.user.id },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!wallet) {
                await t.rollback();
                return res.status(404).json({ message: "Portefeuille non trouvé." });
            }

            // Math secured calculation (Math.round to avoid float drift issues like 0.1 + 0.2 = 0.3000004)
            const numericMontant = Math.round(Number(montant) * 100) / 100;
            const nouveauSolde = Math.round((Number(wallet.solde_virtuel) + numericMontant) * 100) / 100;

            wallet.solde_virtuel = nouveauSolde;
            await wallet.save({ transaction: t });

            // Tracabilité (Ledger)
            const tx = await Transaction.create({
                portefeuille_id: wallet.id,
                type_transaction: 'depot',
                montant: numericMontant,
                statut: 'complete',
                reference_externe: reference_externe || `RECH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                metadata: { mode_paiement, source: 'user_recharge' }
            }, { transaction: t });

            await t.commit();
            res.json({ message: "Recharge réussie avec succès", solde: nouveauSolde, transaction: tx });
        } catch (error) {
            await t.rollback();
            console.error('Erreur critique Recharge Wallet:', error);
            next(error); // Express handle error nicely
        }
    },

    // Transfert entre utilisateurs (ex: Client -> Vendeur)
    transfer: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { destinataireId, montant, motif, reference_externe } = req.body;
            
            // Validation Métier
            if (!montant || isNaN(montant) || Number(montant) <= 0) {
                await t.rollback();
                return res.status(400).json({ message: "Montant invalide. Le montant spécifié doit être supérieur à 0." });
            }
            if (String(req.user.id) === String(destinataireId)) {
                await t.rollback();
                return res.status(400).json({ message: "Opération frauduleuse : le destinataire est identique à l'expéditeur." });
            }

            // Idempotence : Ne pas débiter/créditer deux fois la même référence
            if (reference_externe) {
                const existingTx = await Transaction.findOne({ where: { reference_externe }, transaction: t });
                if (existingTx) {
                    await t.rollback();
                    return res.status(200).json({ message: "Ce transfert a déjà été traité avec succès.", transaction: existingTx });
                }
            }

            // ⚠️ ACQUISITION DES VERROUS DÉTERMINISTE ⚠️
            // On trie les IDs pour toujours verrouiller dans le même ordre, empêchant les Deadlocks DB croisés.
            const walletsToLock = [req.user.id, destinataireId].sort();

            await Wallet.findAll({
                where: { user_id: walletsToLock },
                transaction: t,
                lock: t.LOCK.UPDATE
            }); 

            // Récupération des instances maintenant verrouillées
            const sourceWallet = await Wallet.findOne({ where: { user_id: req.user.id }, transaction: t });
            const destWallet = await Wallet.findOne({ where: { user_id: destinataireId }, transaction: t });

            if (!sourceWallet || !destWallet) {
                await t.rollback();
                return res.status(404).json({ message: "L'un des portefeuilles est introuvable." });
            }

            // Calcul Arrondi sécurisé (pas de Float drift)
            const numericMontant = Math.round(Number(montant) * 100) / 100;
            const soldeSource = Math.round(Number(sourceWallet.solde_virtuel) * 100) / 100;

            // Protection anti-solde négatif
            if (soldeSource < numericMontant) {
                await t.rollback();
                return res.status(400).json({ message: "Fonds insuffisants pour exécuter ce transfert." });
            }

            // 1. Débit Atomique
            sourceWallet.solde_virtuel = Math.round((soldeSource - numericMontant) * 100) / 100;
            await sourceWallet.save({ transaction: t });

            // 2. Crédit Atomique
            destWallet.solde_virtuel = Math.round((Number(destWallet.solde_virtuel) + numericMontant) * 100) / 100;
            await destWallet.save({ transaction: t });

            // Ledger (Traçabilité stricte)
            const refBase = reference_externe || `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

            // 3. Validation Finale (Aucun crash n'a eu lieu)
            await t.commit();
            res.json({ message: "Transfert sécurisé effectué avec succès.", transaction: txDebit });
            
        } catch (error) {
            // Rollback d'urgence pour assurer l'intégrité du Ledger
            await t.rollback();
            console.error('Erreur Critique Transfert Wallet:', error);
            next(error); 
        }
    }
};

module.exports = walletController;
