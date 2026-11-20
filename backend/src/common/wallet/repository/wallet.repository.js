const Wallet = require('../models/wallet.model');
const Transaction = require('../../transactions/models/transaction.model');

const walletRepository = {
    findByUserId(userId, { transaction } = {}) {
        return Wallet.findOne({ where: { user_id: userId }, transaction });
    },

    findByUserIdForUpdate(userId, transaction) {
        return Wallet.findOne({
            where: { user_id: userId },
            transaction,
            lock: transaction?.LOCK?.UPDATE,
        });
    },

    findByUserIdsForUpdate(userIds, transaction) {
        return Wallet.findAll({
            where: { user_id: userIds },
            transaction,
            lock: transaction?.LOCK?.UPDATE,
        });
    },

    findById(id, { transaction } = {}) {
        return Wallet.findOne({ where: { id }, transaction });
    },

    findByIdForUpdate(id, transaction) {
        return Wallet.findOne({
            where: { id },
            transaction,
            lock: transaction?.LOCK?.UPDATE,
        });
    },

    findWithRecentTransactions(userId, limit = 10) {
        return Wallet.findOne({
            where: { user_id: userId },
            include: [{
                model: Transaction,
                as: 'transactions',
                limit,
                order: [['createdAt', 'DESC']],
            }],
        });
    },

    create(data, { transaction } = {}) {
        return Wallet.create(data, { transaction });
    },

    save(wallet, { transaction } = {}) {
        return wallet.save({ transaction });
    },

    decrementBalance(wallet, amount, { transaction } = {}) {
        return wallet.decrement('solde_virtuel', { by: amount, transaction });
    },
};

module.exports = walletRepository;
