const catchAsync = require('../../utils/catchAsync');
const categoryService = require('../service/category.service');

const categoryController = {
    getAll: catchAsync(async (req, res) => {
        const categories = await categoryService.getAll();
        res.json(categories);
    }),

    create: catchAsync(async (req, res) => {
        const category = await categoryService.create(req.body);
        res.status(201).json(category);
    }),

    update: catchAsync(async (req, res) => {
        const category = await categoryService.update(req.params.id, req.body);
        res.json(category);
    }),

    delete: catchAsync(async (req, res) => {
        const result = await categoryService.delete(req.params.id, req);
        res.json(result);
    })
};

module.exports = categoryController;
