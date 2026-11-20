const adService = require('../service/ad.service');

const adController = {
    // Liste toutes les publicités (pour admin ou pour le feed public avec filtres)
    getAll: async (req, res, next) => {
        try {
            console.log(`[DEBUG ADS] Get All - User: ${req.user?.role}`);
            const ads = await adService.getAll(req.query, req.user);
            console.log(`[DEBUG ADS] Found: ${ads.length}`);
            res.json(ads);
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            const result = await adService.create(req.body, req.user);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.status(201).json(result.ad);
        } catch (error) {
            next(error);
        }
    },

    getForUser: async (req, res, next) => {
        try {
            const io = req.app.get('socketio');
            const ads = await adService.getForUser(req.user, io);
            res.json(ads);
        } catch (error) {
            next(error);
        }
    },

    recordClick: async (req, res, next) => {
        try {
            const io = req.app.get('socketio');
            await adService.recordClick(req.params.id, io);
            res.json({ message: 'Clic enregistré' });
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const result = await adService.getById(req.params.id, req.user);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.json(result.ad);
        } catch (error) {
            next(error);
        }
    },

    getStats: async (req, res, next) => {
        try {
            const result = await adService.getStats(req.params.id, req.user);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.json(result.stats);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const result = await adService.update(req.params.id, req.body, req.user);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.json(result.ad);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const result = await adService.delete(req.params.id, req.user, req);
            if (result.outcome === 'rejected') {
                return res.status(result.status).json({ message: result.message });
            }
            res.json({ message: "Publicité supprimée avec succès" });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = adController;
