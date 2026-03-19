const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const userController = {
    // Liste paginée avec recherche et filtre par rôle
    getAll: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search = '', role = '' } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (search) {
                where[Op.or] = [
                    { nom_complet: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ];
            }
            if (role) {
                where.role = role;
            }

            const { count, rows: users } = await User.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                attributes: { exclude: ['mot_de_passe'] },
                order: [['createdAt', 'DESC']]
            });

            res.json({
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                users
            });
        } catch (error) {
            next(error);
        }
    },

    // Création par un admin
    create: async (req, res, next) => {
        try {
            const { nom_complet, email, mot_de_passe, role, telephone } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Cet email est déjà utilisé." });
            }

            const user = await User.create({
                nom_complet,
                email,
                mot_de_passe, // Sera haché par le hook du modèle
                role: role || 'client',
                telephone,
                statut: 'actif'
            });

            const userJson = user.toJSON();
            delete userJson.mot_de_passe;

            res.status(201).json(userJson);
        } catch (error) {
            next(error);
        }
    },

    // Mise à jour par un admin
    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { nom_complet, email, mot_de_passe, role, statut, telephone } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            const updateData = {
                nom_complet: nom_complet || user.nom_complet,
                email: email || user.email,
                role: role || user.role,
                statut: statut || user.statut,
                telephone: telephone || user.telephone
            };

            if (mot_de_passe) {
                updateData.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
            }

            await user.update(updateData);

            const userJson = user.toJSON();
            delete userJson.mot_de_passe;

            res.json(userJson);
        } catch (error) {
            next(error);
        }
    },

    // Suppression par un admin
    delete: async (req, res, next) => {
        try {
            const { id } = req.params;

            // Empêcher de se supprimer soi-même
            if (id === req.user.id.toString()) {
                return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte admin." });
            }

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            await user.destroy();
            res.json({ message: "Utilisateur supprimé avec succès." });
        } catch (error) {
            next(error);
        }
    },

    // Changement de statut rapide
    updateStatus: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { statut } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            await user.update({ statut });
            res.json({ message: `Statut mis à jour : ${statut}` });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController;
