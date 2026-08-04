const webinarService = require('../service/webinar.service');

const webinarController = {
    // Obtenir la liste des webinaires (ouverts à tous)
    getAll: async (req, res, next) => {
        try {
            const webinars = await webinarService.getAll();
            res.json(webinars);
        } catch (error) {
            next(error);
        }
    },

    // Obtenir un webinaire spécifique
    getById: async (req, res, next) => {
        try {
            const webinar = await webinarService.getById(req.params.id);
            if (!webinar) {
                return res.status(404).json({ message: "Webinaire introuvable." });
            }
            res.json(webinar);
        } catch (error) {
            next(error);
        }
    },

    // Créer un webinaire (Admin)
    create: async (req, res, next) => {
        try {
            const webinar = await webinarService.create(req.body);
            res.status(201).json(webinar);
        } catch (error) {
            next(error);
        }
    },

    // Mettre à jour un webinaire (Admin)
    update: async (req, res, next) => {
        try {
            const io = req.app.get('socketio');
            const webinar = await webinarService.update(req.params.id, req.body, io);
            if (!webinar) {
                return res.status(404).json({ message: "Webinaire introuvable." });
            }
            res.json(webinar);
        } catch (error) {
            next(error);
        }
    },

    // Supprimer un webinaire (Admin)
    delete: async (req, res, next) => {
        try {
            const deleted = await webinarService.delete(req.params.id, req);
            if (!deleted) {
                return res.status(404).json({ message: "Webinaire introuvable." });
            }
            res.json({ message: "Webinaire supprimé avec succès." });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = webinarController;
