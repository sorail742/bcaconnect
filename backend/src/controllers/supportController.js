const { Ticket, Review, Order, Product, sequelize } = require('../models');

const supportController = {
    // 1. Créer un ticket SAV
    createTicket: async (req, res, next) => {
        try {
            const { sujet, description, priorite, type_sav, commande_id } = req.body;
            const ticket = await Ticket.create({
                utilisateur_id: req.user.id,
                sujet,
                description,
                priorite,
                type_sav,
                commande_id,
                statut: 'ouvert'
            });
            res.status(201).json(ticket);
        } catch (error) {
            next(error);
        }
    },

    // 2. Récupérer mes tickets
    getMyTickets: async (req, res, next) => {
        try {
            const tickets = await Ticket.findAll({
                where: { utilisateur_id: req.user.id },
                order: [['created_at', 'DESC']]
            });
            res.json(tickets);
        } catch (error) {
            next(error);
        }
    },

    // 3. Soumettre un avis (Feedback) avec IA Sentiment
    createReview: async (req, res, next) => {
        try {
            const { produit_id, commande_id, note, commentaire } = req.body;

            // Simulation IA Sentiment : Analyse très simple pour le backend
            let sentiment = 'neutre';
            const keywordsNeg = ['mauvais', 'déçu', 'problème', 'nul', 'lent', 'cher'];
            const keywordsPos = ['top', 'super', 'génial', 'merci', 'rapide', 'satisfait'];

            const lowerCaseComment = (commentaire || '').toLowerCase();
            if (keywordsNeg.some(k => lowerCaseComment.includes(k))) sentiment = 'negatif';
            else if (keywordsPos.some(k => lowerCaseComment.includes(k))) sentiment = 'positif';

            const review = await Review.create({
                utilisateur_id: req.user.id,
                produit_id,
                commande_id,
                note,
                commentaire,
                ia_sentiment: sentiment
            });

            res.status(201).json(review);
        } catch (error) {
            next(error);
        }
    },

    // 4. Admin : Gérer un ticket
    resolveTicket: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { statut, assigne_a } = req.body;

            const ticket = await Ticket.findByPk(id);
            if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });

            ticket.statut = statut;
            if (assigne_a) ticket.assigne_a = assigne_a;
            await ticket.save();

            res.json({ message: "Ticket mis à jour", ticket });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = supportController;
