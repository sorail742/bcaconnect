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
            const { nom_categorie, description } = req.body;
            const category = await Category.create({ nom_categorie, description });
            res.status(201).json(category);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = categoryController;
