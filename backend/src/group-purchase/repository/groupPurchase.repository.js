const { Op } = require('sequelize');
const AchatGroupe = require('../models/achatGroupe.model');
const AchatGroupeParticipant = require('../models/achatGroupeParticipant.model');
// NOTE: Product/User sont déjà migrées mais n'exposent pas cette forme d'include précise.
const { Product, User } = require('../../models');

const campaignIncludes = [
    { model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'image_url', 'marque', 'prix_unitaire'] },
    { model: User, as: 'organisateur', attributes: ['id', 'nom_complet', 'role'] },
    {
        model: AchatGroupeParticipant,
        as: 'participants',
        attributes: ['id', 'utilisateur_id', 'quantite', 'montant_total', 'statut'],
        include: [{ model: User, as: 'participant', attributes: ['id', 'nom_complet'] }],
    },
];

const groupPurchaseRepository = {
    findAllFiltered(where) {
        return AchatGroupe.findAll({ where, include: campaignIncludes, order: [['createdAt', 'DESC']] });
    },

    findParticipationsByUser(userId) {
        return AchatGroupeParticipant.findAll({
            where: { utilisateur_id: userId, statut: { [Op.ne]: 'annule' } },
            attributes: ['achat_groupe_id'],
        });
    },

    findAllByIds(ids) {
        return AchatGroupe.findAll({ where: { id: { [Op.in]: ids } }, include: campaignIncludes, order: [['createdAt', 'DESC']] });
    },

    findByIdFull(id) {
        return AchatGroupe.findByPk(id, { include: campaignIncludes });
    },

    findByIdForUpdate(id, transaction) {
        return AchatGroupe.findByPk(id, { lock: transaction?.LOCK?.UPDATE, transaction });
    },

    findByIdForUpdateWithParticipants(id, transaction) {
        return AchatGroupe.findByPk(id, {
            include: [
                { model: Product, as: 'produit' },
                {
                    model: AchatGroupeParticipant,
                    as: 'participants',
                    where: { statut: 'engage' },
                    required: false,
                },
            ],
            lock: transaction?.LOCK?.UPDATE,
            transaction,
        });
    },

    create(data) {
        return AchatGroupe.create(data);
    },

    save(campaign, { transaction } = {}) {
        return campaign.save({ transaction });
    },

    findParticipantActive(campaignId, userId, { transaction } = {}) {
        return AchatGroupeParticipant.findOne({
            where: { achat_groupe_id: campaignId, utilisateur_id: userId, statut: { [Op.ne]: 'annule' } },
            transaction,
        });
    },

    findParticipantEngaged(campaignId, userId, { transaction } = {}) {
        return AchatGroupeParticipant.findOne({
            where: { achat_groupe_id: campaignId, utilisateur_id: userId, statut: 'engage' },
            transaction,
        });
    },

    createParticipant(data, { transaction } = {}) {
        return AchatGroupeParticipant.create(data, { transaction });
    },

    saveParticipant(participant, { transaction } = {}) {
        return participant.save({ transaction });
    },
};

module.exports = groupPurchaseRepository;
