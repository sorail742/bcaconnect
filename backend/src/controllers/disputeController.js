const { Litige, Order, User, Notification } = require('../models');
const aiService = require('../services/aiService');

/**
 * Créer un nouveau litige (avec médiation Groq IA réelle)
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

        // ✅ Médiation IA réelle via Groq
        let solutionIA = "Analyse IA en cours.";
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
            console.warn('[Litige] Fallback IA activé:', aiErr.message);
            // Fallback statique si l'IA est indisponible
            const fallbacks = {
                livraison: { txt: "Remboursement partiel des frais de port ou relivraison.", score: 0.3 },
                qualite: { txt: "Retour gratuit contre remboursement intégral ou bon d'achat.", score: 0.7 },
                paiement: { txt: "Vérification manuelle par le support financier sous 24h.", score: 0.6 },
            };
            const fb = fallbacks[type] || { txt: "Discussion directe via la messagerie recommandée.", score: 0.5 };
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
            statut: 'ouvert'
        });

        // ⚡ NOTIFICATION POUR LE DÉFENSEUR
        const io = req.app.get('socketio');
        if (io && defenseur_id) {
            const disputeNotif = await Notification.create({
                utilisateur_id: defenseur_id,
                titre: "Nouveau litige ouvert",
                message: `Un litige de type <span class="font-bold text-destructive">${type}</span> a été ouvert concernant la commande <span class="font-black text-primary">#${commande_id.slice(0, 8)}</span>.`,
                type: 'dispute'
            });
            io.to(defenseur_id).emit('notification_received', disputeNotif);
        }

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

        // ⚡ NOTIFICATIONS POUR LES DEUX PARTIES
        const io = req.app.get('socketio');
        if (io) {
            // Pour le plaignant
            const resNotifPlaint = await Notification.create({
                utilisateur_id: litige.demandeur_id,
                titre: "Litige résolu",
                message: `Une décision a été rendue pour votre litige concernant la commande <span class="font-black text-primary">#${litige.commande_id.slice(0, 8)}</span>.`,
                type: 'dispute'
            });
            io.to(litige.demandeur_id).emit('notification_received', resNotifPlaint);

            // Pour le défenseur
            const resNotifDef = await Notification.create({
                utilisateur_id: litige.defenseur_id,
                titre: "Litige résolu",
                message: `Le litige concernant la commande <span class="font-black text-primary">#${litige.commande_id.slice(0, 8)}</span> a été clos par l'administration.`,
                type: 'dispute'
            });
            io.to(litige.defenseur_id).emit('notification_received', resNotifDef);
        }

        res.json(litige);
    } catch (error) {
        res.status(500).json({ message: "Erreur résolution litige", error: error.message });
    }
};
