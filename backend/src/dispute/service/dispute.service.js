const { sequelize } = require('../../models');
const AppError = require('../../utils/AppError');
const aiService = require('../../ai/service/ai.service');
const escrowService = require('../../common/escrow/service/escrow.service');
const disputeRepository = require('../repository/dispute.repository');

const DISPUTE_STATUSES = ['ouvert', 'en_cours', 'en_mediation', 'resolu', 'ferme', 'archive'];
const RESOLUTION_TYPES = ['mediation_seule', 'remboursement_integral', 'remboursement_partiel', 'bon_achat', 'liberation_vendeur'];
const ACTIVE_STATUSES = ['ouvert', 'en_cours', 'en_mediation'];

const notifyParty = async (io, userId, titre, message, type = 'dispute') => {
    if (!io || !userId) return;
    const notif = await disputeRepository.createNotification({ utilisateur_id: userId, titre, message, type });
    io.to(userId).emit('notification_received', notif);
};

const addEvent = async (litigeId, type, auteurId, message, meta = null, transaction = null) => {
    return disputeRepository.addEvent({
        litige_id: litigeId,
        auteur_id: auteurId,
        type,
        message,
        meta: meta ? JSON.stringify(meta) : null,
    }, { transaction });
};

const fetchDisputeFull = (id) => disputeRepository.findFull(id);

const getOrderPartyIds = (order) => {
    const parties = new Set();
    if (order.utilisateur_id) parties.add(order.utilisateur_id);
    if (order.transporteur_id) parties.add(order.transporteur_id);
    for (const item of order.details || []) {
        if (item.fournisseur_id) parties.add(item.fournisseur_id);
    }
    return parties;
};

const resolveDefaultDefenseur = (order, type, demandeurId) => {
    if (type === 'livraison' && order.transporteur_id && order.transporteur_id !== demandeurId) {
        return order.transporteur_id;
    }
    const vendor = (order.details || []).find(
        (item) => item.fournisseur_id && item.fournisseur_id !== demandeurId,
    );
    if (vendor) return vendor.fournisseur_id;
    return [...getOrderPartyIds(order)].find((id) => id !== demandeurId) || null;
};

const disputeService = {
    async createDispute({ commande_id, type, description, defenseur_id: defenseurInput, preuves }, user, io) {
        const demandeur_id = user.id;

        const order = await disputeRepository.findOrderWithDetails(commande_id);
        if (!order) throw new AppError('Commande non trouvée.', 404);

        const orderParties = getOrderPartyIds(order);
        const isAdmin = user.role === 'admin';

        if (!isAdmin && !orderParties.has(demandeur_id)) {
            throw new AppError('Vous n\'êtes pas partie prenante de cette commande.', 403);
        }

        let defenseur_id = defenseurInput || resolveDefaultDefenseur(order, type, demandeur_id);
        if (!defenseur_id) {
            throw new AppError('Impossible d\'identifier le défenseur pour cette commande.', 400);
        }
        if (!orderParties.has(defenseur_id)) {
            throw new AppError('Le défenseur indiqué n\'est pas lié à cette commande.', 403);
        }
        if (defenseur_id === demandeur_id) {
            throw new AppError('Le défenseur doit être une autre partie de la commande.', 400);
        }

        const existing = await disputeRepository.findActiveByOrder(commande_id, ACTIVE_STATUSES);
        if (existing) throw new AppError('Un litige est déjà ouvert pour cette commande.', 409);

        let solutionIA = 'Analyse IA en cours.';
        let scoreGravite = 0.5;

        try {
            const mediation = await aiService.mediateDispute({
                type,
                description,
                montant: order.total_ttc,
                statut_commande: order.statut,
            });
            solutionIA = mediation.solution_proposee || solutionIA;
            scoreGravite = mediation.score_gravite || scoreGravite;
        } catch (aiErr) {
            const fallbacks = {
                livraison: { txt: 'Remboursement partiel des frais de port ou relivraison.', score: 0.3 },
                qualite: { txt: 'Retour gratuit contre remboursement intégral ou bon d\'achat.', score: 0.7 },
                paiement: { txt: 'Vérification manuelle par le support financier sous 24h.', score: 0.6 },
            };
            const fb = fallbacks[type] || { txt: 'Discussion directe via la messagerie recommandée.', score: 0.5 };
            solutionIA = fb.txt;
            scoreGravite = fb.score;
        }

        const t = await sequelize.transaction();
        try {
            const litige = await disputeRepository.create({
                commande_id,
                demandeur_id,
                defenseur_id,
                type,
                description,
                solution_proposee_ia: solutionIA,
                ia_score_gravite: scoreGravite,
                statut: 'ouvert',
                preuves: preuves ? JSON.stringify(preuves) : null,
            }, { transaction: t });

            await addEvent(
                litige.id,
                'ouverture',
                demandeur_id,
                `Litige ouvert — ${type}. ${description.slice(0, 200)}`,
                { type, commande_id },
                t,
            );
            await addEvent(
                litige.id,
                'proposition_ia',
                null,
                solutionIA,
                { score_gravite: scoreGravite },
                t,
            );

            await t.commit();

            await notifyParty(
                io,
                defenseur_id,
                'Nouveau litige ouvert',
                `Un litige de type <span class="font-bold text-destructive">${type}</span> a été ouvert concernant la commande <span class="font-black text-primary">#${commande_id.slice(0, 8)}</span>.`,
            );

            return fetchDisputeFull(litige.id);
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },

    async getMyDisputes(userId) {
        return disputeRepository.findAllForUser(userId);
    },

    async getDisputeById(id, user) {
        const litige = await fetchDisputeFull(id);
        if (!litige) throw new AppError('Litige non trouvé.', 404);

        const isParty = litige.demandeur_id === user.id || litige.defenseur_id === user.id;
        if (!isParty && user.role !== 'admin') {
            throw new AppError('Accès non autorisé.', 403);
        }

        return litige;
    },

    async getAllDisputes(statut) {
        return disputeRepository.findAllAdmin(statut);
    },

    async respondToDispute(id, message, user, io) {
        const litige = await disputeRepository.findById(id);
        if (!litige) throw new AppError('Litige non trouvé.', 404);

        if (litige.defenseur_id !== user.id) {
            throw new AppError('Seul le défenseur peut répondre.', 403);
        }
        if (!ACTIVE_STATUSES.includes(litige.statut)) {
            throw new AppError('Ce litige n\'accepte plus de réponses.', 400);
        }

        litige.statut = litige.statut === 'ouvert' ? 'en_cours' : litige.statut;
        await disputeRepository.save(litige);

        await addEvent(litige.id, 'reponse_defenseur', user.id, message);

        await notifyParty(
            io,
            litige.demandeur_id,
            'Réponse au litige',
            `Le vendeur a répondu à votre litige #${litige.id.slice(0, 8)}.`,
        );

        return fetchDisputeFull(litige.id);
    },

    async acceptProposal(id, user, io) {
        const litige = await disputeRepository.findById(id);
        if (!litige) throw new AppError('Litige non trouvé.', 404);

        if (litige.demandeur_id !== user.id) {
            throw new AppError('Seul le demandeur peut accepter la proposition.', 403);
        }
        if (!ACTIVE_STATUSES.includes(litige.statut)) {
            throw new AppError('Ce litige est déjà clos.', 400);
        }
        if (!litige.solution_proposee_ia) {
            throw new AppError('Aucune proposition IA disponible.', 400);
        }

        litige.decision_finale = `Proposition IA acceptée par le demandeur : ${litige.solution_proposee_ia}`;
        litige.resolution_type = 'mediation_seule';
        litige.statut = 'resolu';
        await disputeRepository.save(litige);

        await addEvent(
            litige.id,
            'acceptation',
            user.id,
            'Le demandeur a accepté la proposition de médiation IA.',
            { solution: litige.solution_proposee_ia },
        );
        await addEvent(litige.id, 'resolution', user.id, litige.decision_finale, { resolution_type: 'mediation_seule' });

        await notifyParty(io, litige.defenseur_id, 'Litige résolu', `Le client a accepté la médiation IA pour le litige #${litige.id.slice(0, 8)}.`);

        return fetchDisputeFull(litige.id);
    },

    async escalateDispute(id, motif, user, io) {
        const litige = await disputeRepository.findById(id);
        if (!litige) throw new AppError('Litige non trouvé.', 404);

        const isParty = litige.demandeur_id === user.id || litige.defenseur_id === user.id;
        if (!isParty) throw new AppError('Accès non autorisé.', 403);
        if (!ACTIVE_STATUSES.includes(litige.statut)) {
            throw new AppError('Ce litige est déjà clos.', 400);
        }

        litige.statut = 'en_mediation';
        await disputeRepository.save(litige);

        const msg = motif || 'Escalade vers un médiateur humain demandée.';
        await addEvent(litige.id, 'escalade', user.id, msg);

        const otherParty = litige.demandeur_id === user.id ? litige.defenseur_id : litige.demandeur_id;
        await notifyParty(io, otherParty, 'Litige escaladé', `Le litige #${litige.id.slice(0, 8)} a été escaladé vers l'administration.`);
        const admins = await disputeRepository.findAdmins();
        for (const admin of admins) {
            await notifyParty(io, admin.id, 'Litige à arbitrer', `Escalade sur le litige #${litige.id.slice(0, 8)} — intervention requise.`);
        }

        return fetchDisputeFull(litige.id);
    },

    async updateDisputeStatus(id, statut, user, io) {
        if (!DISPUTE_STATUSES.includes(statut)) {
            throw new AppError(`Statut invalide. Valeurs: ${DISPUTE_STATUSES.join(', ')}`, 400);
        }

        const litige = await disputeRepository.findById(id);
        if (!litige) throw new AppError('Litige non trouvé.', 404);
        if (['resolu', 'ferme', 'archive'].includes(litige.statut)) {
            throw new AppError('Ce litige est déjà clos.', 400);
        }

        const oldStatut = litige.statut;
        litige.statut = statut;
        await disputeRepository.save(litige);

        await addEvent(
            litige.id,
            'changement_statut',
            user.id,
            `Statut passé de « ${oldStatut} » à « ${statut} ».`,
            { ancien: oldStatut, nouveau: statut },
        );

        const msg = `Le statut de votre litige #${litige.id.slice(0, 8)} est passé à : <span class="font-bold">${statut}</span>.`;
        await notifyParty(io, litige.demandeur_id, 'Mise à jour du litige', msg);
        await notifyParty(io, litige.defenseur_id, 'Mise à jour du litige', msg);

        return fetchDisputeFull(litige.id);
    },

    async resolveDispute(id, { decision_finale, statut, resolution_type, remboursement_montant }, user, io) {
        const t = await sequelize.transaction();
        try {
            const litige = await disputeRepository.findById(id, { transaction: t });
            if (!litige) {
                await t.rollback();
                throw new AppError('Litige non trouvé.', 404);
            }

            if (['resolu', 'ferme', 'archive'].includes(litige.statut)) {
                await t.rollback();
                throw new AppError('Ce litige est déjà résolu.', 400);
            }

            const resolutionType = resolution_type || 'mediation_seule';
            if (!RESOLUTION_TYPES.includes(resolutionType)) {
                await t.rollback();
                throw new AppError('Type de résolution invalide.', 400);
            }

            const order = await disputeRepository.findOrderWithDetails(litige.commande_id, { transaction: t });

            if (!order) {
                await t.rollback();
                throw new AppError('Commande associée introuvable.', 404);
            }

            if (remboursement_montant) {
                litige.remboursement_montant = parseFloat(remboursement_montant);
            }
            litige.resolution_type = resolutionType;

            let financialResult = { refundAmount: 0, resolutionType };

            if (resolutionType !== 'mediation_seule' && order.statut === 'payé') {
                financialResult = await escrowService.processDisputeResolution(
                    order,
                    litige,
                    resolutionType,
                    t,
                );
            }

            litige.decision_finale = decision_finale;
            litige.statut = statut || 'resolu';
            await disputeRepository.save(litige, { transaction: t });

            await addEvent(
                litige.id,
                'resolution',
                user.id,
                decision_finale,
                { resolution_type: resolutionType, remboursement: financialResult.refundAmount },
                t,
            );

            if (financialResult.refundAmount > 0) {
                order.statut = 'retourné';
                await disputeRepository.saveOrder(order, { transaction: t });
            }

            await t.commit();

            const refundMsg = financialResult.refundAmount > 0
                ? ` Un remboursement de <span class="font-black text-emerald-600">${financialResult.refundAmount.toLocaleString('fr-FR')} GNF</span> a été crédité sur votre portefeuille.`
                : '';

            await notifyParty(
                io,
                litige.demandeur_id,
                'Litige résolu',
                `Décision rendue pour la commande #${litige.commande_id.slice(0, 8)}.${refundMsg}`,
            );
            await notifyParty(
                io,
                litige.defenseur_id,
                'Litige clos',
                `Le litige concernant la commande #${litige.commande_id.slice(0, 8)} a été clos par l'administration.`,
            );

            const full = await fetchDisputeFull(litige.id);
            return { litige: full, financial: financialResult };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    async archiveDispute(id, user) {
        const litige = await disputeRepository.findById(id);
        if (!litige) throw new AppError('Litige non trouvé.', 404);

        if (!['resolu', 'ferme'].includes(litige.statut)) {
            throw new AppError('Seul un litige résolu ou fermé peut être archivé.', 400);
        }

        litige.statut = 'archive';
        await disputeRepository.save(litige);

        await addEvent(litige.id, 'archivage', user.id, 'Le litige a été archivé par l\'administration.');

        return fetchDisputeFull(litige.id);
    },
};

module.exports = disputeService;
