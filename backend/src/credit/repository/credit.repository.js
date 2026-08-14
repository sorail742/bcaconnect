const { Op } = require('sequelize');
const Credit = require('../models/credit.model');
const Echeancier = require('../models/echeancier.model');
// NOTE: User/Order/Notification appartiennent à des features distinctes —
// User/Order sont déjà migrées mais n'exposent pas ces formes d'include précises,
// Notification ne l'est pas encore. Tant que ce n'est pas le cas, ces accès
// restent ici plutôt que dans credit.service.js.
const { User, Order, Notification } = require('../../models');

const creditRepository = {
    create(data, { transaction } = {}) {
        return Credit.create(data, { transaction });
    },

    findById(id, { transaction } = {}) {
        return Credit.findByPk(id, { transaction });
    },

    save(credit, { transaction } = {}) {
        return credit.save({ transaction });
    },

    findPending() {
        return Credit.findAll({
            where: { statut: 'en_attente' },
            include: [
                { model: User, as: 'utilisateur', attributes: ['id', 'nom_complet', 'email', 'telephone', 'role'] },
                { model: Order, attributes: ['id', 'total_ttc', 'statut'] },
            ],
            order: [['created_at', 'DESC']],
        });
    },

    findActiveWithApplicant() {
        return Credit.findAll({
            where: { statut: { [Op.in]: ['en_attente', 'approuve'] } },
            include: [{ model: User, as: 'utilisateur', attributes: ['id', 'nom_complet', 'adresse', 'avatar_url'] }],
        });
    },

    findAllByUser(userId) {
        return Credit.findAll({
            where: { utilisateur_id: userId },
            include: [{ model: Echeancier, as: 'echeances', order: [['date_echeance', 'ASC']] }],
            order: [['created_at', 'DESC']]
        });
    },

    // ── Échéancier ───────────────────────────────────────────────────────
    bulkCreateEcheances(echeances, { transaction } = {}) {
        return Echeancier.bulkCreate(echeances, { transaction });
    },

    findEcheanceWithCredit(id, { transaction } = {}) {
        return Echeancier.findByPk(id, { include: [{ model: Credit }], transaction });
    },

    saveEcheance(echeance, { transaction } = {}) {
        return echeance.save({ transaction });
    },

    countUnpaidEcheances(creditId, { transaction } = {}) {
        return Echeancier.count({ where: { credit_id: creditId, statut: { [Op.ne]: 'paye' } }, transaction });
    },

    // NOTE: Notification appartient à la feature `notification` (pas encore migrée).
    createNotification(data) {
        return Notification.create(data);
    },
};

module.exports = creditRepository;
