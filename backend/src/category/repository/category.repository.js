const Category = require('../models/category.model');

const categoryRepository = {
    findAllRootWithChildren() {
        return Category.findAll({
            where: { parent_id: null },
            include: [{
                model: Category,
                as: 'sous_categories',
                separate: true,
                order: [['nom_categorie', 'ASC']],
            }],
            order: [['nom_categorie', 'ASC']],
        });
    },

    findById(id) {
        return Category.findByPk(id);
    },

    create(data) {
        return Category.create(data);
    },

    updateInstance(category, data) {
        return category.update(data);
    },

    destroy(category) {
        return category.destroy();
    },
};

module.exports = categoryRepository;
