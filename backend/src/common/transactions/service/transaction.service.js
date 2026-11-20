const transactionRepository = require('../repository/transaction.repository');

const transactionService = {
    create: (data, opts) => transactionRepository.create(data, opts),
    save: (tx, opts) => transactionRepository.save(tx, opts),
    findByIdForUpdate: (id, dbTransaction, extraWhere) => transactionRepository.findByIdForUpdate(id, dbTransaction, extraWhere),
    findAndCountByWalletId: (walletId, opts) => transactionRepository.findAndCountByWalletId(walletId, opts),
    findAndCountAllWithWalletUser: (opts) => transactionRepository.findAndCountAllWithWalletUser(opts),
    findPendingWithdrawals: () => transactionRepository.findPendingWithdrawals(),
    findByIdWithWallet: (id) => transactionRepository.findByIdWithWallet(id),
    countByWalletSince: (walletId, since, statuses) => transactionRepository.countByWalletSince(walletId, since, statuses),
    sumMontantByWalletSince: (walletId, since, statuses) => transactionRepository.sumMontantByWalletSince(walletId, since, statuses),

    // Utilisée par recharge/transfer/webhook pour l'idempotence par référence externe.
    async findExistingByReference(reference, { transaction } = {}) {
        if (!reference) return null;
        return transactionRepository.findByReference(reference, { transaction });
    },
};

module.exports = transactionService;
