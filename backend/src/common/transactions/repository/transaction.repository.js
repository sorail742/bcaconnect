const { Op } = require('sequelize');
const sequelize = require('../../../config/database');
const Transaction = require('../models/transaction.model');
const { Wallet, User } = require('../../../models');

const transactionRepository = {
    create(data, { transaction } = {}) {
        return Transaction.create(data, { transaction });
    },

    save(tx, { transaction } = {}) {
        return tx.save({ transaction });
    },

    findByReference(reference, { transaction } = {}) {
        return Transaction.findOne({ where: { reference_externe: reference }, transaction });
    },

    // Pas d'`include` ici : Postgres refuse `FOR UPDATE` sur le côté nullable
    // d'une jointure externe (portefeuille_id est nullable sur Transaction).
    findByIdForUpdate(id, transaction, extraWhere = {}) {
        return Transaction.findOne({
            where: { id, ...extraWhere },
            transaction,
            lock: transaction?.LOCK?.UPDATE,
        });
    },

    findAndCountByWalletId(walletId, { limit, offset } = {}) {
        return Transaction.findAndCountAll({
            where: { portefeuille_id: walletId },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
    },

    findAndCountAllWithWalletUser({ search = '', limit, offset } = {}) {
        const term = (search || '').trim();
        const isPostgres = sequelize.getDialect() === 'postgres';
        const likeOp = isPostgres ? Op.iLike : Op.like;
        const where = term ? {
            [Op.or]: [
                sequelize.where(sequelize.cast(sequelize.col('Transaction.id'), 'TEXT'), { [likeOp]: `%${term}%` }),
                { '$Wallet.User.nom_complet$': { [likeOp]: `%${term}%` } },
                { '$Wallet.User.email$': { [likeOp]: `%${term}%` } },
            ],
        } : {};

        return Transaction.findAndCountAll({
            where,
            include: [{
                model: Wallet,
                include: [{ model: User, attributes: ['nom_complet', 'role', 'email'] }],
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            subQuery: false,
        });
    },

    findPendingWithdrawals() {
        return Transaction.findAll({
            where: { type_transaction: 'retrait', statut: 'en_attente' },
            include: [{ model: Wallet, include: [{ model: User, attributes: ['id', 'nom_complet', 'email', 'role'] }] }],
            order: [['createdAt', 'ASC']],
        });
    },

    findByIdWithWallet(id) {
        return Transaction.findByPk(id, { include: [{ model: Wallet }] });
    },

    // Agrégats génériques (utilisés par le scoring anti-fraude paiement/wallet) —
    // `statuses` est optionnel : omis, aucun filtre de statut n'est appliqué.
    countByWalletSince(walletId, since, statuses) {
        const where = { portefeuille_id: walletId, created_at: { [Op.gte]: since } };
        if (statuses) where.statut = { [Op.in]: statuses };
        return Transaction.count({ where });
    },

    sumMontantByWalletSince(walletId, since, statuses) {
        const where = { portefeuille_id: walletId, created_at: { [Op.gte]: since } };
        if (statuses) where.statut = { [Op.in]: statuses };
        return Transaction.sum('montant', { where });
    },
};

module.exports = transactionRepository;
