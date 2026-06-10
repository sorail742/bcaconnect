const { User, Wallet } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { deleteUserCompletely } = require('../services/userDeletionService');

const ALLOWED_ROLES = ['client', 'fournisseur', 'transporteur', 'technicien', 'banque', 'admin'];

const userController = {
    // Liste paginée avec recherche et filtre par rôle
    getAll: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search = '', role = '' } = req.query;
            const offset = (page - 1) * limit;

            const where = {
                statut: { [Op.ne]: 'supprime' },
            };
            const likeOp = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
            if (search) {
                where[Op.or] = [
                    { nom_complet: { [likeOp]: `%${search}%` } },
                    { email: { [likeOp]: `%${search}%` } },
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

            // Calculate dynamic stats
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

            const currentCount = await User.count({
                where: { createdAt: { [Op.gte]: thirtyDaysAgo }, statut: { [Op.ne]: 'supprime' } },
            });
            const previousCount = await User.count({
                where: { createdAt: { [Op.between]: [sixtyDaysAgo, thirtyDaysAgo] }, statut: { [Op.ne]: 'supprime' } },
            });
            const growth = previousCount === 0 ? 100 : ((currentCount - previousCount) / previousCount) * 100;
            const newLast7Days = await User.count({
                where: { createdAt: { [Op.gte]: sevenDaysAgo }, statut: { [Op.ne]: 'supprime' } },
            });

            res.json({
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                users,
                stats: {
                    growth: growth.toFixed(1),
                    newLast7Days,
                    status: 'Actif'
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Recherche publique (id, nom, rôle) pour la messagerie - Ouvert à tous les membres
    getPublicUsers: async (req, res, next) => {
        try {
            const { search = '' } = req.query;
            // Include both 'actif' and 'en_attente' so users can be found even if not fully validated yet
            const where = {
                statut: { [Op.notIn]: ['bloque', 'supprime', 'suspendu'] },
                id: { [Op.ne]: req.user.id },
            };

            const term = String(search || '').trim();
            const likeOp = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
            if (term) {
                where[Op.or] = [
                    { nom_complet: { [likeOp]: `%${term}%` } },
                    { email: { [likeOp]: `%${term}%` } },
                    { role: { [likeOp]: `%${term}%` } },
                ];
            }

            const users = await User.findAll({
                where,
                limit: 20,
                attributes: ['id', 'nom_complet', 'role', 'statut', 'email'],
                order: [['nom_complet', 'ASC']]
            });

            res.json(users);
        } catch (error) {
            next(error);
        }
    },

    // Création par un admin
    create: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { nom_complet, email, mot_de_passe, role, telephone } = req.body;

            if (!mot_de_passe || mot_de_passe.length < 6) {
                await t.rollback();
                return res.status(422).json({ message: "Mot de passe trop court (min 6 caractères)." });
            }

            if (role && !ALLOWED_ROLES.includes(role)) {
                await t.rollback();
                return res.status(422).json({ message: "Rôle invalide." });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                await t.rollback();
                return res.status(400).json({ message: "Cet email est déjà utilisé." });
            }

            const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

            const user = await User.create({
                nom_complet,
                email,
                mot_de_passe: hashedPassword,
                role: role || 'client',
                telephone,
                statut: 'actif'
            }, { transaction: t });

            await Wallet.create({ user_id: user.id }, { transaction: t });

            await t.commit();

            const userJson = user.toJSON();
            delete userJson.mot_de_passe;

            res.status(201).json(userJson);
        } catch (error) {
            await t.rollback();
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

    // Suppression définitive (admin) — retire l'utilisateur de la base
    delete: async (req, res, next) => {
        try {
            const { id } = req.params;

            if (id === req.user.id.toString()) {
                return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte admin." });
            }

            const result = await deleteUserCompletely(id);
            if (!result.ok) {
                return res.status(result.status || 500).json({ message: result.message });
            }

            res.json({ message: result.message, id });
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
