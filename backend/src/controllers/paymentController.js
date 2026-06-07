const { Transaction, Wallet, Notification, Order, sequelize } = require('../models');

const { Op } = require('sequelize');

const { v4: uuidv4 } = require('uuid');

const paymentProviderService = require('../services/paymentProviderService');

const escrowService = require('../services/escrowService');

const catchAsync = require('../utils/catchAsync');

const AppError = require('../utils/AppError');



const checkFraudIA = async (user_id, montant) => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);



    const wallet = await Wallet.findOne({ where: { user_id } });

    if (!wallet) return false;



    const recentTransactions = await Transaction.count({

        where: {

            portefeuille_id: wallet.id,

            created_at: { [Op.gte]: today },

            statut: 'complete'

        }

    });



    return parseFloat(montant || 0) > 5000000 || recentTransactions > 10;

};



const resolveOrderId = (body) => body.order_id || body.commande_id;



exports.initiateDeposit = catchAsync(async (req, res, next) => {

    const montant = req.body.montant || req.body.amount;

    const moyen_paiement = req.body.moyen_paiement || req.body.method || req.body.methode_paiement || 'mobile_money';

    const orderId = resolveOrderId(req.body);



    if (!montant || parseFloat(montant) <= 0) {

        return next(new AppError('Le montant est requis et doit être positif.', 400));

    }



    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });

    if (!wallet) return next(new AppError('Portefeuille non trouvé.', 404));



    let order = null;

    if (orderId) {

        order = await Order.findOne({ where: { id: orderId, utilisateur_id: req.user.id } });

        if (!order) return next(new AppError('Commande introuvable.', 404));

        if (order.statut !== 'en_attente_paiement') {

            return next(new AppError('Cette commande ne peut plus être payée.', 400));

        }

        if (Math.abs(parseFloat(montant) - parseFloat(order.total_ttc)) > 0.01) {

            return next(new AppError('Le montant ne correspond pas au total de la commande.', 400));

        }

    }



    const isSuspect = await checkFraudIA(req.user.id, montant);

    const paymentType = orderId ? 'order_payment' : 'wallet_deposit';



    const transaction = await Transaction.create({

        portefeuille_id: wallet.id,

        commande_id: orderId || null,

        montant: parseFloat(montant),

        type_transaction: orderId ? 'achat_produit' : 'depot',

        statut: 'en_attente',

        reference_externe: `PAY-${uuidv4().slice(0, 8)}`,

        ia_suspect: isSuspect,

        metadata: {

            moyen_paiement,

            provider: paymentProviderService.isConfigured() ? 'cinetpay' : 'simulation',

            type: paymentType,

            commande_id: orderId || undefined

        }

    });



    const description = orderId

        ? `Commande BCA #${orderId.slice(0, 8)}`

        : 'Recharge Portefeuille BCA';



    const returnPath = orderId
        ? `/payment/return?tx=${transaction.id}&type=order&order_id=${orderId}`
        : `/payment/return?tx=${transaction.id}&type=wallet`;

    const payment_url = await paymentProviderService.generatePaymentUrl(
        transaction.id,
        parseFloat(montant),
        description,
        req.user.telephone,
        {
            returnPath,
            metadata: { type: paymentType, commande_id: orderId || undefined },
        },
    );



    res.status(201).json({

        message: isSuspect ? 'Transaction initiée (vérification de sécurité en cours)' : 'Transaction initiée',

        payment_url,

        transaction_id: transaction.id,

        order_id: orderId || null,

        is_suspect: isSuspect,

        provider: paymentProviderService.isConfigured() ? 'cinetpay' : 'simulation'

    });

});



const finalizeSuccessfulPayment = async (transaction, req, t) => {

    const orderId = transaction.commande_id || transaction.metadata?.commande_id;

    const isOrderPayment = transaction.metadata?.type === 'order_payment' || !!orderId;



    if (isOrderPayment && orderId) {

        const result = await escrowService.confirmOrderPayment(orderId, t);

        transaction.statut = 'complete';

        await transaction.save({ transaction: t });



        const io = req.app.get('socketio');

        if (io && result.order) {

            const orderNotif = await Notification.create({

                utilisateur_id: result.order.utilisateur_id,

                titre: 'Paiement confirmé !',

                message: `Votre commande <span class="font-black text-primary">#${orderId.slice(0, 8)}</span> est payée. Le séquestre vendeur est activé.`,

                type: 'order'

            });

            io.to(result.order.utilisateur_id).emit('notification_received', orderNotif);

        }



        return { kind: 'order', orderId, result };

    }



    transaction.statut = 'complete';

    await transaction.save({ transaction: t });



    const wallet = await Wallet.findByPk(transaction.portefeuille_id, { transaction: t, lock: t.LOCK.UPDATE });

    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + parseFloat(transaction.montant);

    await wallet.save({ transaction: t });



    const io = req.app.get('socketio');

    if (io) {

        const paymentNotif = await Notification.create({

            utilisateur_id: wallet.user_id,

            titre: 'Recharge réussie !',

            message: `Votre portefeuille BCA a été crédité de <span class="font-black text-emerald-600">${parseFloat(transaction.montant).toLocaleString('fr-FR')} GNF</span>.`,

            type: 'payment'

        });

        io.to(wallet.user_id).emit('notification_received', paymentNotif);

    }



    return { kind: 'wallet', wallet };

};



exports.handleWebhook = catchAsync(async (req, res, next) => {

    if (!paymentProviderService.verifyWebhookSignature(req)) {

        return next(new AppError('Signature webhook non autorisée.', 403));

    }



    const t = await sequelize.transaction();

    try {

        const { transactionId: transaction_id, success } = paymentProviderService.parseWebhookStatus(req.body);



        const transaction = await Transaction.findByPk(transaction_id, { transaction: t, lock: t.LOCK.UPDATE });



        if (!transaction || transaction.statut !== 'en_attente') {

            await t.rollback();

            return next(new AppError('Transaction invalide ou déjà traitée.', 400));

        }



        if (success) {

            if (paymentProviderService.isConfigured()) {

                const verified = await paymentProviderService.verifyTransactionStatus(transaction_id);

                if (verified && verified !== 'ACCEPTED' && verified !== 'SUCCESS') {

                    await t.rollback();

                    return next(new AppError('Statut de paiement non confirmé par le provider.', 400));

                }

            }



            await finalizeSuccessfulPayment(transaction, req, t);

            await t.commit();

            return res.json({ message: 'Paiement confirmé.' });

        }



        transaction.statut = 'echoue';

        await transaction.save({ transaction: t });

        await t.commit();

        return res.json({ message: 'Paiement échoué.' });

    } catch (error) {

        await t.rollback();

        next(error);

    }

});



exports.getPaymentStatus = catchAsync(async (req, res, next) => {
    const { transactionId } = req.params;
    const transaction = await Transaction.findByPk(transactionId, {
        include: [{ model: Wallet }],
    });

    if (!transaction) {
        return next(new AppError('Transaction introuvable.', 404));
    }

    const wallet = transaction.Wallet || await Wallet.findByPk(transaction.portefeuille_id);
    if (!wallet || wallet.user_id !== req.user.id) {
        return next(new AppError('Accès non autorisé à cette transaction.', 403));
    }

    let providerStatus = null;
    if (transaction.statut === 'en_attente' && paymentProviderService.isConfigured()) {
        providerStatus = await paymentProviderService.verifyTransactionStatus(transactionId);
    }

    res.json({
        transaction_id: transaction.id,
        statut: transaction.statut,
        montant: parseFloat(transaction.montant),
        order_id: transaction.commande_id || transaction.metadata?.commande_id || null,
        provider: transaction.metadata?.provider || 'simulation',
        provider_status: providerStatus,
        type: transaction.metadata?.type || null,
    });
});

exports.captureSimulation = catchAsync(async (req, res, next) => {

    if (process.env.NODE_ENV === 'production') {

        return next(new AppError('Simulation désactivée en production.', 403));

    }

    if (process.env.PAYMENT_MODE === 'live') {

        return next(new AppError('Mode paiement live actif — simulation désactivée.', 403));

    }



    const t = await sequelize.transaction();

    try {

        const { transaction_id } = req.body;

        const transaction = await Transaction.findByPk(transaction_id, { transaction: t, lock: t.LOCK.UPDATE });



        if (!transaction || transaction.statut !== 'en_attente') {

            await t.rollback();

            return next(new AppError('Transaction invalide.', 400));

        }



        const outcome = await finalizeSuccessfulPayment(transaction, req, t);

        await t.commit();



        if (outcome.kind === 'order') {

            return res.json({

                message: 'Paiement commande confirmé (Simulation)',

                order_id: outcome.orderId,

                statut: 'payé'

            });

        }



        res.json({ message: 'Recharge réussie (Simulation)', solde: outcome.wallet.solde_virtuel });

    } catch (error) {

        await t.rollback();

        next(error);

    }

});

