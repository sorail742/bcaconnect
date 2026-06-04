const { Wallet, Transaction, OrderItem } = require('../models');

/**
 * Service centralisé de gestion du séquestre (escrow) — idempotent par article.
 */
const escrowService = {
    getItemAmount(item) {
        return parseFloat(item.prix_unitaire_achat) * item.quantite;
    },

    async releaseItemEscrow(item, orderId, transaction, referencePrefix = 'REL', metadataType = 'release_escrow') {
        if (item.escrow_released) {
            return { released: false, amount: 0, reason: 'already_released' };
        }

        const amount = this.getItemAmount(item);
        const vendorWallet = await Wallet.findOne({
            where: { user_id: item.fournisseur_id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!vendorWallet) {
            return { released: false, amount: 0, reason: 'no_wallet' };
        }

        const currentSequestre = parseFloat(vendorWallet.solde_sequestre);
        const releaseAmount = Math.min(currentSequestre, amount);

        if (releaseAmount <= 0) {
            item.escrow_released = true;
            await item.save({ transaction });
            return { released: false, amount: 0, reason: 'no_escrow_balance' };
        }

        vendorWallet.solde_sequestre = currentSequestre - releaseAmount;
        vendorWallet.solde_virtuel = parseFloat(vendorWallet.solde_virtuel) + releaseAmount;
        await vendorWallet.save({ transaction });

        await Transaction.create({
            portefeuille_id: vendorWallet.id,
            commande_id: orderId,
            montant: releaseAmount,
            type_transaction: 'depot',
            statut: 'complete',
            reference_externe: `${referencePrefix}-${item.id.slice(0, 8)}-${Date.now().toString(36)}`,
            metadata: { type: metadataType, item_id: item.id }
        }, { transaction });

        item.escrow_released = true;
        await item.save({ transaction });

        return { released: true, amount: releaseAmount };
    },

    async releaseOrderEscrow(orderId, items, transaction, metadataType = 'release_escrow') {
        const results = [];
        for (const item of items) {
            results.push(await this.releaseItemEscrow(item, orderId, transaction, 'REL', metadataType));
        }
        return results;
    },

    async reverseItemEscrow(item, orderId, transaction) {
        if (item.escrow_released) {
            return this._clawbackFromVendor(item, orderId, transaction);
        }

        const amount = this.getItemAmount(item);
        const vendorWallet = await Wallet.findOne({
            where: { user_id: item.fournisseur_id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!vendorWallet) return { reversed: false, amount: 0 };

        const reversed = Math.min(parseFloat(vendorWallet.solde_sequestre), amount);
        vendorWallet.solde_sequestre = Math.max(0, parseFloat(vendorWallet.solde_sequestre) - reversed);
        await vendorWallet.save({ transaction });

        if (reversed > 0) {
            await Transaction.create({
                portefeuille_id: vendorWallet.id,
                commande_id: orderId,
                montant: reversed,
                type_transaction: 'retrait',
                statut: 'complete',
                metadata: { type: 'escrow_reversal', item_id: item.id }
            }, { transaction });
        }

        return { reversed: true, amount: reversed, from: 'sequestre' };
    },

    async _clawbackFromVendor(item, orderId, transaction) {
        const amount = this.getItemAmount(item);
        const vendorWallet = await Wallet.findOne({
            where: { user_id: item.fournisseur_id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!vendorWallet) return { reversed: false, amount: 0 };

        const clawback = Math.min(parseFloat(vendorWallet.solde_virtuel), amount);
        vendorWallet.solde_virtuel = Math.max(0, parseFloat(vendorWallet.solde_virtuel) - clawback);
        await vendorWallet.save({ transaction });

        if (clawback > 0) {
            await Transaction.create({
                portefeuille_id: vendorWallet.id,
                commande_id: orderId,
                montant: clawback,
                type_transaction: 'retrait',
                statut: 'complete',
                metadata: { type: 'escrow_clawback', item_id: item.id }
            }, { transaction });
        }

        return { reversed: true, amount: clawback, from: 'virtuel' };
    },

    async refundBuyer(order, amount, transaction, referencePrefix = 'REFUND') {
        const buyerWallet = await Wallet.findOne({
            where: { user_id: order.utilisateur_id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!buyerWallet) {
            throw new Error('Portefeuille acheteur introuvable pour remboursement.');
        }

        const refund = parseFloat(amount);
        buyerWallet.solde_virtuel = parseFloat(buyerWallet.solde_virtuel) + refund;
        await buyerWallet.save({ transaction });

        await Transaction.create({
            portefeuille_id: buyerWallet.id,
            commande_id: order.id,
            montant: refund,
            type_transaction: 'remboursement',
            statut: 'complete',
            reference_externe: `${referencePrefix}-${order.id.slice(0, 8)}-${Date.now().toString(36)}`,
            metadata: { type: 'dispute_refund' }
        }, { transaction });

        return refund;
    },

    async depositOrderEscrow(orderId, orderItems, transaction) {
        const vendorsToCredit = {};
        for (const item of orderItems) {
            const vendorId = item.fournisseur_id;
            const amount = parseFloat(item.prix_unitaire_achat) * item.quantite;
            vendorsToCredit[vendorId] = (vendorsToCredit[vendorId] || 0) + amount;
        }

        for (const [vendorId, amount] of Object.entries(vendorsToCredit)) {
            const vWallet = await Wallet.findOne({
                where: { user_id: vendorId },
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!vWallet) continue;

            vWallet.solde_sequestre = parseFloat(vWallet.solde_sequestre) + parseFloat(amount);
            await vWallet.save({ transaction });

            await Transaction.create({
                portefeuille_id: vWallet.id,
                commande_id: orderId,
                montant: amount,
                type_transaction: 'depot',
                statut: 'en_attente',
                metadata: { type: 'escrow_deposit', description: 'Fonds mis en séquestre suite à une vente' }
            }, { transaction });
        }
    },

    async confirmOrderPayment(orderId, transaction) {
        const { Order } = require('../models');
        const order = await Order.findByPk(orderId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!order) {
            throw new Error('Commande introuvable.');
        }
        if (order.statut === 'payé') {
            return { confirmed: false, reason: 'already_paid' };
        }
        if (order.statut !== 'en_attente_paiement') {
            throw new Error(`Statut commande invalide pour paiement: ${order.statut}`);
        }

        const items = await OrderItem.findAll({ where: { commande_id: orderId }, transaction });
        await this.depositOrderEscrow(orderId, items, transaction);

        order.statut = 'payé';
        await order.save({ transaction });

        return { confirmed: true, order, items };
    },

    async processDisputeResolution(order, litige, resolutionType, transaction) {
        const items = await OrderItem.findAll({
            where: { commande_id: order.id },
            transaction
        });

        const type = resolutionType || 'mediation_seule';

        if (type === 'liberation_vendeur') {
            await this.releaseOrderEscrow(order.id, items, transaction, 'dispute_vendor_win');
            return { refundAmount: 0, resolutionType: type };
        }

        if (type === 'mediation_seule') {
            return { refundAmount: 0, resolutionType: type };
        }

        let refundAmount = 0;

        if (type === 'remboursement_integral') {
            refundAmount = parseFloat(order.total_ttc);
        } else if (type === 'remboursement_partiel' || type === 'bon_achat') {
            refundAmount = parseFloat(litige.remboursement_montant || order.total_ttc * 0.5);
        }

        for (const item of items) {
            await this.reverseItemEscrow(item, order.id, transaction);
        }

        if (refundAmount > 0) {
            await this.refundBuyer(order, refundAmount, transaction, 'DISPUTE');
        }

        return { refundAmount, resolutionType: type };
    }
};

module.exports = escrowService;
