const { Ticket, Order } = require('../models');

const supportController = {
    // 1. Créer un ticket SAV
    createTicket: async (req, res, next) => {
        try {
            const { sujet, description, priorite, type_sav, commande_id } = req.body;

            if (!sujet || sujet.trim().length < 3) {
                return res.status(422).json({ message: "Le sujet doit contenir au moins 3 caractères." });
            }

            const ticket = await Ticket.create({
                utilisateur_id: req.user.id,
                sujet: sujet.trim(),
                description,
                priorite: priorite || 'moyenne',
                type_sav: type_sav || 'assistance',
                commande_id: commande_id || null,
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

    // 3. Admin : Gérer un ticket
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
