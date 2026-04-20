const { Credit, Echeancier, Order, Wallet, sequelize } = require('../models');
const { Op } = require('sequelize');
const aiScoringService = require('../services/aiScoringService');

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

        await t.commit();
        res.json({ message: "Crédit approuvé et échéancier généré", credit });
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
