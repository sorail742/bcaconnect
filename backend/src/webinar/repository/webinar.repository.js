const Webinar = require('../models/webinar.model');

const webinarRepository = {
    findAll() {
        return Webinar.findAll({ order: [['date_heure', 'ASC']] });
    },

    findById(id) {
        return Webinar.findByPk(id);
    },

    create(data) {
        return Webinar.create(data);
    },

    updateInstance(webinar, data) {
        return webinar.update(data);
    },

    destroy(webinar) {
        return webinar.destroy();
    },
};

module.exports = webinarRepository;
