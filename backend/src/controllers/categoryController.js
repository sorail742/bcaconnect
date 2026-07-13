const { Category } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const categoryController = {
    getAll: catchAsync(async (req, res, next) => {
        const categories = await Category.findAll({
            where: { parent_id: null },
            include: [{
                model: Category,
                as: 'sous_categories',
                separate: true,
                order: [['nom_categorie', 'ASC']],
            }],
            order: [['nom_categorie', 'ASC']],
        });
        res.json(categories);
    }),

    create: catchAsync(async (req, res, next) => {
        const { nom_categorie, description, image_url, parent_id } = req.body;
        const category = await Category.create({ 
            nom_categorie, 
            description,
            image_url: image_url || null,
            parent_id: parent_id || null
        });
        res.status(201).json(category);
    }),

    update: catchAsync(async (req, res, next) => {
        const { id } = req.params;
        const { nom_categorie, description, image_url, parent_id } = req.body;
        const category = await Category.findByPk(id);
        
        if (!category) {
            return next(new AppError("Catégorie non trouvée.", 404));
        }

        await category.update({ 
            nom_categorie, 
            description,
            image_url: image_url !== undefined ? image_url : category.image_url,
            parent_id: parent_id !== undefined ? parent_id : category.parent_id
        });
        res.json(category);
    }),

    delete: catchAsync(async (req, res, next) => {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        
        if (!category) {
            return next(new AppError("Catégorie non trouvée.", 404));
        }

        await category.destroy();
        res.json({ message: "Catégorie supprimée avec succès." });
    })
};

module.exports = categoryController;
