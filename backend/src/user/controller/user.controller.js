const userService = require('../service/user.service');

const userController = {
    getAll: async (req, res, next) => {
        try {
            const result = await userService.getAll(req.query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    getUserLocations: async (req, res, next) => {
        try {
            const result = await userService.getUserLocations(req.query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    getPublicUsers: async (req, res, next) => {
        try {
            const result = await userService.getPublicUsers(req.query, req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            const user = await userService.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const user = await userService.update(req.params.id, req.body);
            res.json(user);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const result = await userService.delete(req.params.id, req);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    updateStatus: async (req, res, next) => {
        try {
            const result = await userService.updateStatus(req.params.id, req.body.statut);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    // Mise à jour de l'avatar par l'utilisateur lui-même
    updateAvatar: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Aucune image fournie." });
            }

            const fileUrl = `/uploads/avatars/${req.file.filename}`;
            const result = await userService.updateAvatar(req.user.id, fileUrl);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController;
