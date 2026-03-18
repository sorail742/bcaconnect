const { Litige, Order, User } = require('../models');

/**
 * Créer un nouveau litige
 */
exports.createDispute = async (req, res) => {
    try {
        const { commande_id, type, description, defenseur_id } = req.body;
        const demandeur_id = req.user.id;

        // Vérifier si la commande existe
        const order = await Order.findByPk(commande_id);
        if (!order) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Simuler une analyse IA pour proposer une solution de médiation
        let solutionIA = "";
        let scoreGravite = 0.5;

        switch (type) {
            case 'livraison':
                solutionIA = "L'IA suggère un remboursement partiel des frais de port ou une relivraison prioritaire.";
                scoreGravite = 0.3;
                break;
            case 'qualite':
                solutionIA = "L'IA suggère un retour gratuit contre remboursement intégral ou un bon d'achat de 20%.";
                scoreGravite = 0.7;
                break;
            case 'paiement':
                solutionIA = "L'IA suggère une vérification manuelle par le support financier sous 24h.";
                scoreGravite = 0.6;
                break;
            default:
                solutionIA = "L'IA suggère une discussion directe entre les parties via la messagerie.";
        }

        const litige = await Litige.create({
            commande_id,
            demandeur_id,
            defenseur_id,
            type,
            description,
            solution_proposee_ia: solutionIA,
            ia_score_gravite: scoreGravite,
            statut: 'ouvert'
        });

        res.status(201).json(litige);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du litige", error: error.message });
    }
};

/**
 * Récupérer les litiges pour l'utilisateur connecté
 */
exports.getMyDisputes = async (req, res) => {
    try {
        const litiges = await Litige.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { demandeur_id: req.user.id },
                    { defenseur_id: req.user.id }
                ]
            },
            include: [
                { model: Order, attributes: ['id', 'statut', 'total_ttc'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(litiges);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération litiges", error: error.message });
    }
};

/**
 * Récupérer tous les litiges (Admin seulement)
 */
exports.getAllDisputes = async (req, res) => {
    try {
        const litiges = await Litige.findAll({
            include: [
                { model: User, as: 'demandeur', attributes: ['nom_complet', 'role'] },
                { model: User, as: 'defenseur', attributes: ['nom_complet', 'role'] }
            ]
        });
        res.json(litiges);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération litiges", error: error.message });
    }
};

/**
 * Résoudre un litige
 */
exports.resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision_finale, statut } = req.body;

        const litige = await Litige.findByPk(id);
        if (!litige) return res.status(404).json({ message: "Litige non trouvé" });

        litige.decision_finale = decision_finale;
        litige.statut = statut || 'resolu';
        await litige.save();

        res.json(litige);
    } catch (error) {
        res.status(500).json({ message: "Erreur résolution litige", error: error.message });
    }
};
