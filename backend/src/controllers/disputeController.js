const { Litige, Order, OrderItem, User, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const aiService = require('../services/aiService');
const escrowService = require('../services/escrowService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const DISPUTE_STATUSES = ['ouvert', 'en_cours', 'en_mediation', 'resolu', 'ferme'];
const RESOLUTION_TYPES = ['mediation_seule', 'remboursement_integral', 'remboursement_partiel', 'bon_achat', 'liberation_vendeur'];

const notifyParty = async (io, userId, titre, message, type = 'dispute') => {
    if (!io || !userId) return;
    const notif = await Notification.create({ utilisateur_id: userId, titre, message, type });
    io.to(userId).emit('notification_received', notif);
};

exports.createDispute = catchAsync(async (req, res, next) => {
    const { commande_id, type, description, defenseur_id, preuves } = req.body;
    const demandeur_id = req.user.id;

    const order = await Order.findByPk(commande_id, {
        include: [{ model: OrderItem, as: 'details' }]
    });
    if (!order) return next(new AppError('Commande non trouvée.', 404));

    const existing = await Litige.findOne({
        where: { commande_id, statut: { [Op.in]: ['ouvert', 'en_cours', 'en_mediation'] } }
    });
    if (existing) return next(new AppError('Un litige est déjà ouvert pour cette commande.', 409));

    let solutionIA = 'Analyse IA en cours.';
    let scoreGravite = 0.5;

    try {
        const mediation = await aiService.mediateDispute({
            type,
            description,
            montant: order.total_ttc,
            statut_commande: order.statut
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

    const litige = await Litige.create({
        commande_id,
        demandeur_id,
        defenseur_id,
        type,
        description,
        solution_proposee_ia: solutionIA,
        ia_score_gravite: scoreGravite,
        statut: 'ouvert',
        preuves: preuves ? JSON.stringify(preuves) : null
    });

    const io = req.app.get('socketio');
    await notifyParty(
        io,
        defenseur_id,
        'Nouveau litige ouvert',
        `Un litige de type <span class="font-bold text-destructive">${type}</span> a été ouvert concernant la commande <span class="font-black text-primary">#${commande_id.slice(0, 8)}</span>.`
    );

    res.status(201).json(litige);
});

exports.getMyDisputes = catchAsync(async (req, res) => {
    const litiges = await Litige.findAll({
        where: {
            [Op.or]: [
                { demandeur_id: req.user.id },
                { defenseur_id: req.user.id }
            ]
        },
        include: [{ model: Order, attributes: ['id', 'statut', 'total_ttc'] }],
        order: [['created_at', 'DESC']]
    });
    res.json(litiges);
});

exports.getDisputeById = catchAsync(async (req, res, next) => {
    const litige = await Litige.findByPk(req.params.id, {
        include: [
            { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'role'] },
            { model: User, as: 'defenseur', attributes: ['id', 'nom_complet', 'role'] },
            { model: Order, attributes: ['id', 'total_ttc', 'statut', 'statut_livraison'] }
        ]
    });

    if (!litige) return next(new AppError('Litige non trouvé.', 404));

    const isParty = litige.demandeur_id === req.user.id || litige.defenseur_id === req.user.id;
    if (!isParty && req.user.role !== 'admin') {
        return next(new AppError('Accès non autorisé.', 403));
    }

    res.json(litige);
});

exports.getAllDisputes = catchAsync(async (req, res) => {
    const { statut } = req.query;
    const where = statut ? { statut } : {};

    const litiges = await Litige.findAll({
        where,
        include: [
            { model: User, as: 'demandeur', attributes: ['nom_complet', 'role'] },
            { model: User, as: 'defenseur', attributes: ['nom_complet', 'role'] },
            { model: Order, attributes: ['id', 'total_ttc', 'statut'] }
        ],
        order: [['created_at', 'DESC']]
    });
    res.json(litiges);
});

exports.updateDisputeStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { statut } = req.body;

    if (!DISPUTE_STATUSES.includes(statut)) {
        return next(new AppError(`Statut invalide. Valeurs: ${DISPUTE_STATUSES.join(', ')}`, 400));
    }

    const litige = await Litige.findByPk(id);
    if (!litige) return next(new AppError('Litige non trouvé.', 404));
    if (['resolu', 'ferme'].includes(litige.statut)) {
        return next(new AppError('Ce litige est déjà clos.', 400));
    }

    litige.statut = statut;
    await litige.save();

    const io = req.app.get('socketio');
    const msg = `Le statut de votre litige #${litige.id.slice(0, 8)} est passé à : <span class="font-bold">${statut}</span>.`;
    await notifyParty(io, litige.demandeur_id, 'Mise à jour du litige', msg);
    await notifyParty(io, litige.defenseur_id, 'Mise à jour du litige', msg);

    res.json(litige);
});

exports.resolveDispute = catchAsync(async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { decision_finale, statut, resolution_type, remboursement_montant } = req.body;

        const litige = await Litige.findByPk(id, { transaction: t });
        if (!litige) {
            await t.rollback();
            return next(new AppError('Litige non trouvé.', 404));
        }

        if (['resolu', 'ferme'].includes(litige.statut)) {
            await t.rollback();
            return next(new AppError('Ce litige est déjà résolu.', 400));
        }

        const resolutionType = resolution_type || 'mediation_seule';
        if (!RESOLUTION_TYPES.includes(resolutionType)) {
            await t.rollback();
            return next(new AppError(`Type de résolution invalide.`, 400));
        }

        const order = await Order.findByPk(litige.commande_id, {
            transaction: t,
            include: [{ model: OrderItem, as: 'details' }]
        });

        if (!order) {
            await t.rollback();
            return next(new AppError('Commande associée introuvable.', 404));
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
                t
            );
        }

        litige.decision_finale = decision_finale;
        litige.statut = statut || 'resolu';
        await litige.save({ transaction: t });

        if (financialResult.refundAmount > 0) {
            order.statut = 'retourné';
            await order.save({ transaction: t });
        }

        await t.commit();

        const io = req.app.get('socketio');
        const refundMsg = financialResult.refundAmount > 0
            ? ` Un remboursement de <span class="font-black text-emerald-600">${financialResult.refundAmount.toLocaleString('fr-FR')} GNF</span> a été crédité sur votre portefeuille.`
            : '';

        await notifyParty(
            io,
            litige.demandeur_id,
            'Litige résolu',
            `Décision rendue pour la commande #${litige.commande_id.slice(0, 8)}.${refundMsg}`
        );
        await notifyParty(
            io,
            litige.defenseur_id,
            'Litige clos',
            `Le litige concernant la commande #${litige.commande_id.slice(0, 8)} a été clos par l'administration.`
        );

        res.json({ litige, financial: financialResult });
    } catch (error) {
        await t.rollback();
        next(error);
    }
});
