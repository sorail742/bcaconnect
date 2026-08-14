const catchAsync = require('../../utils/catchAsync');
const supportService = require('../service/support.service');

const supportController = {
    // 1. Créer un ticket SAV
    createTicket: catchAsync(async (req, res) => {
        const result = await supportService.createTicket(req.user.id, req.body);
        if (result.outcome === 'invalid_sujet') {
            return res.status(422).json({ message: "Le sujet doit contenir au moins 3 caractères." });
        }
        res.status(201).json(result.ticket);
    }),

    // 2. Récupérer mes tickets
    getMyTickets: catchAsync(async (req, res) => {
        const tickets = await supportService.getMyTickets(req.user.id);
        res.json(tickets);
    }),

    // 3. Admin : Gérer un ticket
    resolveTicket: catchAsync(async (req, res) => {
        const result = await supportService.resolveTicket(req.params.id, req.body);
        if (result.outcome === 'not_found') {
            return res.status(404).json({ message: "Ticket non trouvé" });
        }
        res.json({ message: "Ticket mis à jour", ticket: result.ticket });
    }),
};

module.exports = supportController;
