const { recordDeletion } = require('../../deletion-log/service/deletionLog.service');
const webinarRepository = require('../repository/webinar.repository');

const webinarService = {
    // Obtenir la liste des webinaires (ouverts à tous)
    async getAll() {
        return webinarRepository.findAll();
    },

    // Obtenir un webinaire spécifique
    async getById(id) {
        return webinarRepository.findById(id);
    },

    // Créer un webinaire (Admin)
    async create({ titre, description, date_heure, intervenant, categorie, lien_rejoindre, video_url }) {
        return webinarRepository.create({
            titre,
            description,
            date_heure,
            intervenant,
            categorie,
            lien_rejoindre,
            video_url
        });
    },

    // Mettre à jour un webinaire (Admin)
    async update(id, body, io) {
        const webinar = await webinarRepository.findById(id);
        if (!webinar) return null;

        const wasLive = webinar.statut === 'en_direct';
        await webinarRepository.updateInstance(webinar, body);

        // Notifier tous les utilisateurs connectés quand un webinaire passe "en direct"
        if (!wasLive && body.statut === 'en_direct') {
            try {
                if (io) {
                    io.emit('webinar_go_live', {
                        id: webinar.id,
                        titre: webinar.titre,
                        intervenant: webinar.intervenant,
                        lien_rejoindre: webinar.lien_rejoindre,
                    });
                }
            } catch (e) {
                console.warn('[WEBINAR] Socket notification error:', e.message);
            }
        }

        return webinar;
    },

    // Supprimer un webinaire (Admin)
    async delete(id, req) {
        const webinar = await webinarRepository.findById(id);
        if (!webinar) return false;

        await recordDeletion('Webinar', webinar, { req });
        await webinarRepository.destroy(webinar);
        return true;
    }
};

module.exports = webinarService;
