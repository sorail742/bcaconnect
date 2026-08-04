const { Op } = require('sequelize');
const RfqRequest = require('../models/rfqRequest.model');
const RfqQuote = require('../models/rfqQuote.model');
// NOTE: User/Category sont déjà migrées mais n'exposent pas ces formes
// d'include précises ; Notification/Conversation/ConversationParticipant ne le
// sont pas encore (features `notification` / `message`).
const { User, Category, Notification, Conversation, ConversationParticipant } = require('../../models');

const requesterInclude = { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'role'] };
const categorieInclude = { model: Category, as: 'categorie', attributes: ['id', 'nom_categorie'] };
const quoteFournisseurInclude = { model: User, as: 'fournisseur', attributes: ['id', 'nom_complet', 'role'] };

const rfqRepository = {
    create(data) {
        return RfqRequest.create(data);
    },

    findOpenFiltered(categorieId) {
        const where = { statut: 'ouverte' };
        if (categorieId) where.categorie_id = categorieId;

        return RfqRequest.findAll({
            where,
            include: [requesterInclude, categorieInclude],
            order: [['createdAt', 'DESC']],
        });
    },

    findMineWithQuotes(userId) {
        return RfqRequest.findAll({
            where: { utilisateur_id: userId },
            include: [
                categorieInclude,
                { model: RfqQuote, as: 'devis', include: [quoteFournisseurInclude], order: [['prix_unitaire', 'ASC']] },
            ],
            order: [['createdAt', 'DESC']],
        });
    },

    findMyQuotes(userId) {
        return RfqQuote.findAll({
            where: { fournisseur_id: userId },
            include: [{ model: RfqRequest, as: 'demande', include: [requesterInclude] }],
            order: [['createdAt', 'DESC']],
        });
    },

    findByIdFull(id) {
        return RfqRequest.findByPk(id, {
            include: [requesterInclude, categorieInclude, { model: RfqQuote, as: 'devis', include: [quoteFournisseurInclude] }],
        });
    },

    findById(id) {
        return RfqRequest.findByPk(id);
    },

    findByIdWithQuotes(id) {
        return RfqRequest.findByPk(id, { include: [{ model: RfqQuote, as: 'devis' }] });
    },

    save(demande) {
        return demande.save();
    },

    upsertQuote(data) {
        return RfqQuote.upsert(data, { conflictFields: ['demande_id', 'fournisseur_id'] });
    },

    rejectOtherQuotes(demandeId, exceptQuoteId) {
        return RfqQuote.update({ statut: 'refuse' }, { where: { demande_id: demandeId, id: { [Op.ne]: exceptQuoteId } } });
    },

    acceptQuoteById(quoteId) {
        return RfqQuote.update({ statut: 'accepte' }, { where: { id: quoteId } });
    },

    createNotification(data) {
        return Notification.create(data);
    },

    // ── Conversation acheteur/fournisseur (feature `message`, pas encore migrée) ──
    async findOrCreateConversation(userIdA, userIdB) {
        const existing = await ConversationParticipant.findAll({
            where: { user_id: [userIdA, userIdB] },
            attributes: ['conversation_id', 'user_id'],
            raw: true,
        });
        const convUsers = {};
        existing.forEach((p) => {
            if (!convUsers[p.conversation_id]) convUsers[p.conversation_id] = new Set();
            convUsers[p.conversation_id].add(String(p.user_id));
        });
        for (const id of Object.keys(convUsers)) {
            if (convUsers[id].has(String(userIdA)) && convUsers[id].has(String(userIdB))) {
                const total = await ConversationParticipant.count({ where: { conversation_id: id } });
                if (total === 2) return id;
            }
        }
        const conv = await Conversation.create({ dernier_message: '', date_dernier_message: new Date() });
        await ConversationParticipant.bulkCreate([
            { conversation_id: conv.id, user_id: userIdA },
            { conversation_id: conv.id, user_id: userIdB },
        ]);
        return conv.id;
    },
};

module.exports = rfqRepository;
