const { OrderItem } = require('../../../models');
const walletRepository = require('../../wallet/repository/wallet.repository');
const transactionService = require('../../transactions/service/transaction.service');
const { reserveStockForItems } = require('../../../services/orderStockService');
const platformRevenueService = require('../../platform-revenue/service/platform-revenue.service');

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
        const vendorWallet = await walletRepository.findByUserIdForUpdate(item.fournisseur_id, transaction);

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

        // Commission plateforme prélevée sur la part effectivement libérée, jamais sur
        // le montant nominal — si le séquestre avait déjà été partiellement repris
        // (litige), on ne prélève une commission que sur ce qui sort réellement ici.
        const commission = Math.round(releaseAmount * platformRevenueService.COMMISSION_RATE * 100) / 100;
        const platformResult = commission > 0
            ? await platformRevenueService.creditPlatformWallet(commission, {
                commande_id: orderId,
                type: 'commission_plateforme',
                reference_prefix: 'COM',
                metadata: { item_id: item.id, taux: platformRevenueService.COMMISSION_RATE },
            }, transaction)
            : { credited: false, amount: 0 };

        // Si la commission n'a pas pu être prélevée (aucun compte plateforme configuré),
        // le vendeur reçoit l'intégralité plutôt que de faire disparaître cet argent.
        const actualCommission = platformResult.credited ? platformResult.amount : 0;
        const vendorAmount = releaseAmount - actualCommission;

        vendorWallet.solde_sequestre = currentSequestre - releaseAmount;
        vendorWallet.solde_virtuel = parseFloat(vendorWallet.solde_virtuel) + vendorAmount;
        await walletRepository.save(vendorWallet, { transaction });

        await transactionService.create({
            portefeuille_id: vendorWallet.id,
            commande_id: orderId,
            montant: vendorAmount,
            type_transaction: 'depot',
            statut: 'complete',
            reference_externe: `${referencePrefix}-${item.id.slice(0, 8)}-${Date.now().toString(36)}`,
            metadata: { type: metadataType, item_id: item.id, commission_prelevee: actualCommission }
        }, { transaction });

        item.escrow_released = true;
        await item.save({ transaction });

        return { released: true, amount: vendorAmount, commission: actualCommission, grossAmount: releaseAmount };
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
        const vendorWallet = await walletRepository.findByUserIdForUpdate(item.fournisseur_id, transaction);

        if (!vendorWallet) return { reversed: false, amount: 0 };

        const reversed = Math.min(parseFloat(vendorWallet.solde_sequestre), amount);
        vendorWallet.solde_sequestre = Math.max(0, parseFloat(vendorWallet.solde_sequestre) - reversed);
        await walletRepository.save(vendorWallet, { transaction });

        if (reversed > 0) {
            await transactionService.create({
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
        const vendorWallet = await walletRepository.findByUserIdForUpdate(item.fournisseur_id, transaction);

        if (!vendorWallet) return { reversed: false, amount: 0 };

        const clawback = Math.min(parseFloat(vendorWallet.solde_virtuel), amount);
        vendorWallet.solde_virtuel = Math.max(0, parseFloat(vendorWallet.solde_virtuel) - clawback);
        await walletRepository.save(vendorWallet, { transaction });

        if (clawback > 0) {
            await transactionService.create({
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
        const buyerWallet = await walletRepository.findByUserIdForUpdate(order.utilisateur_id, transaction);

        if (!buyerWallet) {
            throw new Error('Portefeuille acheteur introuvable pour remboursement.');
        }

        const refund = parseFloat(amount);
        buyerWallet.solde_virtuel = parseFloat(buyerWallet.solde_virtuel) + refund;
        await walletRepository.save(buyerWallet, { transaction });

        await transactionService.create({
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
            const vWallet = await walletRepository.findByUserIdForUpdate(vendorId, transaction);
            if (!vWallet) continue;

            vWallet.solde_sequestre = parseFloat(vWallet.solde_sequestre) + parseFloat(amount);
            await walletRepository.save(vWallet, { transaction });

            await transactionService.create({
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
        const { Order } = require('../../../models');
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
        await reserveStockForItems(items, transaction);
        await this.depositOrderEscrow(orderId, items, transaction);

        order.statut = 'payé';
        await order.save({ transaction });

        // Si le vendeur avait déjà préparé les articles pendant que le paiement était en
        // attente (mobile money/carte), on débloque la visibilité transporteur maintenant.
        const { resyncPickupAfterPayment } = require('../../../services/deliveryNotificationService');
        const pickupSync = await resyncPickupAfterPayment(orderId, transaction);

        return { confirmed: true, order, items, carrierReady: !!pickupSync?.ready };
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
