const { Op } = require('sequelize');
const { EducationalResource } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const ROLE_AUDIENCE = {
    client: 'clients',
    fournisseur: 'fournisseurs',
    transporteur: 'transporteurs',
};

const audienceForRole = (role) => {
    if (!role || role === 'admin') return null;
    return ROLE_AUDIENCE[role] || 'tous';
};

const educationController = {
    getAllResources: catchAsync(async (req, res) => {
        const audience = audienceForRole(req.user?.role);
        const where = audience
            ? { audience_cible: { [Op.in]: ['tous', audience] } }
            : {};

        const resources = await EducationalResource.findAll({
            where,
            order: [['created_at', 'DESC']],
        });

        res.json(resources);
    }),

    getAllAdmin: catchAsync(async (req, res) => {
        const resources = await EducationalResource.findAll({
            order: [['created_at', 'DESC']],
        });
        res.json(resources);
    }),

    create: catchAsync(async (req, res, next) => {
        const { titre, description, type_contenu, url_contenu, audience_cible, tag } = req.body;

        if (!titre?.trim() || !description?.trim() || !url_contenu?.trim()) {
            return next(new AppError('titre, description et url_contenu sont requis.', 400));
        }

        const resource = await EducationalResource.create({
            titre: titre.trim(),
            description: description.trim(),
            type_contenu: type_contenu || 'article',
            url_contenu: url_contenu.trim(),
            audience_cible: audience_cible || 'tous',
            tag: tag?.trim() || null,
        });

        res.status(201).json(resource);
    }),

    update: catchAsync(async (req, res, next) => {
        const resource = await EducationalResource.findByPk(req.params.id);
        if (!resource) return next(new AppError('Ressource introuvable.', 404));

        const { titre, description, type_contenu, url_contenu, audience_cible, tag } = req.body;

        await resource.update({
            titre: titre?.trim() ?? resource.titre,
            description: description?.trim() ?? resource.description,
            type_contenu: type_contenu ?? resource.type_contenu,
            url_contenu: url_contenu?.trim() ?? resource.url_contenu,
            audience_cible: audience_cible ?? resource.audience_cible,
            tag: tag !== undefined ? (tag?.trim() || null) : resource.tag,
        });

        res.json(resource);
    }),

    delete: catchAsync(async (req, res, next) => {
        const resource = await EducationalResource.findByPk(req.params.id);
        if (!resource) return next(new AppError('Ressource introuvable.', 404));

        await resource.destroy();
        res.json({ message: 'Ressource supprimée.' });
    }),
};

module.exports = educationController;
