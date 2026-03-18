const { Credit, Echeancier, Order, Wallet, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Calculer les mensualités pour une simulation
 */
const calculateInstallments = (montant, taux, mois) => {
    const r = (taux / 100) / 12; // Taux mensuel
    const mensualite = (montant * r * Math.pow(1 + r, mois)) / (Math.pow(1 + r, mois) - 1);
    return Math.round(mensualite || (montant / mois)); // Fallback si taux est 0
};

exports.simulateCredit = async (req, res) => {
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
        res.status(500).json({ message: "Erreur simulation", error: error.message });
    }
};

/**
 * Demander un crédit (avec calcul de solvabilité IA simulé)
 */
exports.requestCredit = async (req, res) => {
    try {
        const { montant_principal, taux_interet, duree_mois, commande_id } = req.body;
        const utilisateur_id = req.user.id;

        // IA Simulation : Score de solvabilité basé sur le montant et l'historique
        // (Dans un vrai cas, on analyserait le nombre de commandes passées et payées)
        let scoreIA = 0.5 + (Math.random() * 0.4); // Score entre 0.5 et 0.9
        if (montant_principal > 10000000) scoreIA -= 0.2; // Risque plus élevé pour gros crédits

        const credit = await Credit.create({
            utilisateur_id,
            commande_id,
            montant_principal,
            taux_interet: taux_interet || 0,
            duree_mois,
            ia_score_solvabilite: scoreIA,
            statut: 'en_attente'
        });

        res.status(201).json(credit);
    } catch (error) {
        res.status(500).json({ message: "Erreur demande crédit", error: error.message });
    }
};

/**
 * Approuver un crédit et générer l'échéancier (Admin)
 */
exports.approveCredit = async (req, res) => {
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
        res.status(500).json({ message: "Erreur approbation", error: error.message });
    }
};

/**
 * Payer une échéance spécifique
 */
exports.payInstallment = async (req, res) => {
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
        res.status(500).json({ message: "Erreur paiement échéance", error: error.message });
    }
};

/**
 * Récupérer mes crédits et leurs échéanciers
 */
exports.getMyCredits = async (req, res) => {
    try {
        const credits = await Credit.findAll({
            where: { utilisateur_id: req.user.id },
            include: [{ model: Echeancier, as: 'echeances', order: [['date_echeance', 'ASC']] }],
            order: [['created_at', 'DESC']]
        });
        res.json(credits);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération crédits", error: error.message });
    }
};
