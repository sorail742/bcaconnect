const { Op, literal } = require('sequelize');
const Publicite = require('../models/publicite.model');
const PubliciteCiblage = require('../models/publiciteCiblage.model');
const PubliciteStat = require('../models/publiciteStat.model');
const PaiementPublicite = require('../models/paiementPublicite.model');
const walletRepository = require('../../common/wallet/repository/wallet.repository');
const transactionService = require('../../common/transactions/service/transaction.service');

const adRepository = {
    findAllFiltered(where) {
        return Publicite.findAll({
            where,
            include: [
                { model: PubliciteCiblage, as: 'ciblages' },
                { model: PubliciteStat, as: 'stats' }
            ],
            order: [['createdAt', 'DESC']]
        });
    },

    create(data, { transaction } = {}) {
        return Publicite.create(data, { transaction });
    },

    createCiblage(data, { transaction } = {}) {
        return PubliciteCiblage.create(data, { transaction });
    },

    createStat(data, { transaction } = {}) {
        return PubliciteStat.create(data, { transaction });
    },

    createPaiement(data, { transaction } = {}) {
        return PaiementPublicite.create(data, { transaction });
    },

    findActiveForRole(role) {
        return Publicite.findAll({
            where: {
                statut: 'actif',
                date_debut: { [Op.lte]: new Date() },
                date_fin: { [Op.gte]: new Date() },
                budget_restant: { [Op.gt]: 0 }
            },
            include: [{
                model: PubliciteCiblage,
                as: 'ciblages',
                where: {
                    [Op.or]: [
                        { role_cible: role },
                        { role_cible: 'all' }
                    ]
                }
            }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
    },

    incrementStat(adId, field) {
        return PubliciteStat.increment(field, { where: { publicite_id: adId } });
    },

    decrementBudgetForClick(adId) {
        return Publicite.update(
            { budget_restant: literal('CASE WHEN budget_restant >= 100 THEN budget_restant - 100 ELSE 0 END') },
            { where: { id: adId } }
        );
    },

    findByIdAttributes(id, attributes) {
        return Publicite.findByPk(id, { attributes });
    },

    updateStatut(id, statut) {
        return Publicite.update({ statut }, { where: { id } });
    },

    findById(id) {
        return Publicite.findByPk(id);
    },

    findByIdWithCiblagesStats(id) {
        return Publicite.findByPk(id, {
            include: [
                { model: PubliciteCiblage, as: 'ciblages' },
                { model: PubliciteStat, as: 'stats' },
            ],
        });
    },

    findByIdWithStats(id) {
        return Publicite.findByPk(id, {
            include: [{ model: PubliciteStat, as: 'stats' }]
        });
    },

    findByIdForUpdate(id, transaction) {
        return Publicite.findByPk(id, { transaction, lock: transaction?.LOCK?.UPDATE });
    },

    updateInstance(ad, data, { transaction } = {}) {
        return ad.update(data, { transaction });
    },

    destroy(ad) {
        return ad.destroy();
    },

    // ── Traversées vers le module `common` (wallet/transactions, déjà migrés) ──
    findWalletByUserIdForUpdate(userId, transaction) {
        return walletRepository.findByUserIdForUpdate(userId, transaction);
    },

    saveWallet(wallet, transaction) {
        return walletRepository.save(wallet, { transaction });
    },

    createTransaction(data, transaction) {
        return transactionService.create(data, { transaction });
    },
};

module.exports = adRepository;
