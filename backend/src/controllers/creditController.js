const { Credit, Echeancier, Order, OrderItem, Wallet, User, Transaction, Notification, sequelize } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const aiScoringService = require('../services/aiScoringService');
const escrowService = require('../services/escrowService');

/**
 * Calculer les mensualités pour une simulation
 */
const calculateInstallments = (montant, taux, mois) => {
    const r = (taux / 100) / 12; // Taux mensuel
    const mensualite = (montant * r * Math.pow(1 + r, mois)) / (Math.pow(1 + r, mois) - 1);
    return Math.round(mensualite || (montant / mois)); // Fallback si taux est 0
};

exports.simulateCredit = async (req, res, next) => {
    try {
        const { montant, taux, mois } = req.body;
        const mensualite = calculateInstallments(montant, taux || 0, mois);
        const totalArembourser = mensualite * mois;

        res.json({
            montant_principal: montant,
            taux: taux || 0,
            duree: mois,
            mensualite,
            total_a_rembourser: totalArembourser,
            cout_du_credit: totalArembourser - montant
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Demander un crédit (avec calcul de solvabilité IA réel Alpha-BCA)
 */
exports.requestCredit = async (req, res, next) => {
    try {
        const { montant_principal, taux_interet, duree_mois, commande_id, motif, garanties } = req.body;
        const utilisateur_id = req.user.id;

        // Calcul du score IA via le nouveau moteur prédictif
        const scoring = await aiScoringService.calculateGlobalScore(utilisateur_id);
        
        const credit = await Credit.create({
            utilisateur_id,
            commande_id,
            montant_principal,
            taux_interet: taux_interet || 0,
            duree_mois,
            ia_score_solvabilite: scoring.score,
            motif,
            garanties,
            metadata: {
                scoring_breakdown: scoring.breakdown,
                scoring_version: scoring.metadata.version
            },
            statut: 'en_attente'
        });

        res.status(201).json({
            message: "Demande de crédit soumise avec succès",
            credit,
            ia_analysis: scoring.metadata.status
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer le score IA détaillé de l'utilisateur
 */
exports.getUserScore = async (req, res, next) => {
    try {
        const scoring = await aiScoringService.calculateGlobalScore(req.user.id);
        res.json(scoring);
    } catch (error) {
        next(error);
    }
};

/**
 * Approuver un crédit et générer l'échéancier (Admin)
 */
exports.approveCredit = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const credit = await Credit.findByPk(id, { transaction: t });

        if (!credit || credit.statut !== 'en_attente') {
            await t.rollback();
            return res.status(400).json({ message: "Crédit invalide ou déjà traité." });
        }

        credit.statut = 'approuve';
        credit.date_approbation = new Date();
        await credit.save({ transaction: t });

        // Génération automatique des échéances
        const mensualite = calculateInstallments(credit.montant_principal, credit.taux_interet, credit.duree_mois);
        const echeances = [];

        for (let i = 1; i <= credit.duree_mois; i++) {
            const dateEcheance = new Date();
            dateEcheance.setMonth(dateEcheance.getMonth() + i);

            echeances.push({
                credit_id: credit.id,
                date_echeance: dateEcheance,
                montant_du: mensualite,
                statut: 'du'
            });
        }

        await Echeancier.bulkCreate(echeances, { transaction: t });

        let orderActivated = false;
        let activatedOrder = null;

        if (credit.commande_id) {
            try {
                const orderResult = await escrowService.confirmOrderPayment(credit.commande_id, t);
                if (orderResult.confirmed) {
                    orderActivated = true;
                    activatedOrder = orderResult.order;
                    activatedOrder.methode_paiement = 'credit';
                    await activatedOrder.save({ transaction: t });

                    const wallet = await Wallet.findOne({
                        where: { user_id: credit.utilisateur_id },
                        transaction: t,
                    });
                    if (wallet) {
                        await Transaction.create({
                            portefeuille_id: wallet.id,
                            commande_id: credit.commande_id,
                            montant: credit.montant_principal,
                            type_transaction: 'credit_financement',
                            statut: 'complete',
                            reference_externe: `CREDIT-${credit.id.slice(0, 8)}-${Date.now().toString(36)}`,
                            metadata: { credit_id: credit.id, source: 'bank_approval' },
                        }, { transaction: t });
                    }
                }
            } catch (orderErr) {
                console.warn(`[CREDIT] Commande ${credit.commande_id} non activée:`, orderErr.message);
            }
        }

        await t.commit();

        if (orderActivated && activatedOrder) {
            try {
                const io = req.app.get('socketio');
                if (io) {
                    const buyerNotif = await Notification.create({
                        utilisateur_id: credit.utilisateur_id,
                        titre: 'Crédit approuvé — commande activée',
                        message: `Votre crédit a été approuvé. La commande <span class="font-black text-primary">#${activatedOrder.id.slice(0, 8)}</span> est maintenant payée et en préparation.`,
                        type: 'payment',
                    });
                    io.to(credit.utilisateur_id).emit('notification_received', buyerNotif);

                    const items = await OrderItem.findAll({ where: { commande_id: activatedOrder.id } });
                    const vendorIds = [...new Set(items.map(i => i.fournisseur_id))];
                    for (const vendorId of vendorIds) {
                        const vendorNotif = await Notification.create({
                            utilisateur_id: vendorId,
                            titre: 'Commande financée par crédit',
                            message: `La commande <span class="font-black text-primary">#${activatedOrder.id.slice(0, 8)}</span> a été financée. Préparez les produits.`,
                            type: 'order',
                        });
                        io.to(vendorId).emit('notification_received', vendorNotif);
                    }
                }
            } catch (notifErr) {
                console.warn('[CREDIT] Notification post-approbation:', notifErr.message);
            }
        }

        res.json({
            message: orderActivated
                ? 'Crédit approuvé, échéancier généré et commande activée.'
                : 'Crédit approuvé et échéancier généré',
            credit,
            orderActivated,
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * Payer une échéance spécifique
 */
exports.payInstallment = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const echeance = await Echeancier.findByPk(id, {
            include: [{ model: Credit }],
            transaction: t
        });

        if (!echeance || echeance.statut === 'paye') {
            await t.rollback();
            return res.status(400).json({ message: "Échéance invalide ou déjà payée." });
        }

        const creditOwnerId = echeance.Credit?.utilisateur_id;
        const isOwner = creditOwnerId === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            await t.rollback();
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à payer cette échéance." });
        }

        const wallet = await Wallet.findOne({ where: { user_id: req.user.id }, transaction: t });
        if (!wallet || parseFloat(wallet.solde_virtuel) < parseFloat(echeance.montant_du)) {
            await t.rollback();
            return res.status(400).json({ message: "Solde insuffisant dans votre portefeuille virtuel." });
        }

        wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) - parseFloat(echeance.montant_du);
        await wallet.save({ transaction: t });

        echeance.montant_paye = echeance.montant_du;
        echeance.statut = 'paye';
        echeance.reference_paiement = `CRED-${Date.now()}`;
        await echeance.save({ transaction: t });

        const restes = await Echeancier.count({
            where: { credit_id: echeance.credit_id, statut: { [Op.ne]: 'paye' } },
            transaction: t
        });

        if (restes === 0) {
            const credit = await Credit.findByPk(echeance.credit_id, { transaction: t });
            credit.statut = 'rembourse';
            await credit.save({ transaction: t });
        }

        await t.commit();
        res.json({ message: "Échéance payée avec succès !", echeance });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * Demandes en attente (banque / admin)
 */
exports.getPendingCredits = catchAsync(async (req, res) => {
    const credits = await Credit.findAll({
        where: { statut: 'en_attente' },
        include: [
            { model: User, as: 'utilisateur', attributes: ['id', 'nom_complet', 'email', 'telephone', 'role'] },
            { model: Order, attributes: ['id', 'total_ttc', 'statut'] },
        ],
        order: [['created_at', 'DESC']],
    });
    res.json(credits);
});

/**
 * Refuser une demande de crédit (banque / admin)
 */
exports.rejectCredit = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { motif_refus } = req.body;

    const credit = await Credit.findByPk(id);
    if (!credit || credit.statut !== 'en_attente') {
        return next(new AppError('Demande invalide ou déjà traitée.', 400));
    }

    credit.statut = 'refuse';
    credit.notes_admin = motif_refus || 'Demande refusée par l\'institution financière.';
    await credit.save();

    res.json({ message: 'Demande de crédit refusée.', credit });
});

/**
 * Récupérer mes crédits et leurs échéanciers
 */
exports.getMyCredits = async (req, res, next) => {
    try {
        const credits = await Credit.findAll({
            where: { utilisateur_id: req.user.id },
            include: [{ model: Echeancier, as: 'echeances', order: [['date_echeance', 'ASC']] }],
            order: [['created_at', 'DESC']]
        });
        res.json(credits);
    } catch (error) {
        next(error);
    }
};
