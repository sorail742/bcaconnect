const Ticket = require('../models/ticket.model');

const supportRepository = {
    create(data) {
        return Ticket.create(data);
    },

    findAllByUser(userId) {
        return Ticket.findAll({
            where: { utilisateur_id: userId },
            order: [['created_at', 'DESC']],
        });
    },

    findById(id) {
        return Ticket.findByPk(id);
    },

    save(ticket) {
        return ticket.save();
    },
};

module.exports = supportRepository;
