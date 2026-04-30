const { Category } = require('../models');

const categoryController = {
    getAll: async (req, res, next) => {
        try {
            const categories = await Category.findAll();
            res.json(categories);
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            const { nom_categorie, description, image_url } = req.body;
            const category = await Category.create({ 
                nom_categorie, 
                description,
                image_url: image_url || null 
            });
            res.status(201).json(category);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { nom_categorie, description, image_url } = req.body;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Catégorie non trouvée." });
            }
            await category.update({ 
                nom_categorie, 
                description,
                image_url: image_url !== undefined ? image_url : category.image_url
            });
            res.json(category);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Catégorie non trouvée." });
            }
            await category.destroy();
            res.json({ message: "Catégorie supprimée avec succès." });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = categoryController;
