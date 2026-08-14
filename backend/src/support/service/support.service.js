const supportRepository = require('../repository/support.repository');

const supportService = {
    // 1. Créer un ticket SAV
    async createTicket(userId, { sujet, description, priorite, type_sav, commande_id }) {
        if (!sujet || sujet.trim().length < 3) {
            return { outcome: 'invalid_sujet' };
        }

        const ticket = await supportRepository.create({
            utilisateur_id: userId,
            sujet: sujet.trim(),
            description,
            priorite: priorite || 'moyenne',
            type_sav: type_sav || 'assistance',
            commande_id: commande_id || null,
            statut: 'ouvert'
        });
        return { outcome: 'created', ticket };
    },

    // 2. Récupérer mes tickets
    async getMyTickets(userId) {
        return supportRepository.findAllByUser(userId);
    },

    // 3. Admin : Gérer un ticket
    async resolveTicket(id, { statut, assigne_a }) {
        const ticket = await supportRepository.findById(id);
        if (!ticket) return { outcome: 'not_found' };

        ticket.statut = statut;
        if (assigne_a) ticket.assigne_a = assigne_a;
        await supportRepository.save(ticket);

        return { outcome: 'updated', ticket };
    },
};

module.exports = supportService;
