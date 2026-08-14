const AppError = require('../../utils/AppError');
const { recordDeletion } = require('../../deletion-log/service/deletionLog.service');
const categoryRepository = require('../repository/category.repository');

const categoryService = {
    async getAll() {
        return categoryRepository.findAllRootWithChildren();
    },

    async create({ nom_categorie, description, image_url, parent_id }) {
        return categoryRepository.create({
            nom_categorie,
            description,
            image_url: image_url || null,
            parent_id: parent_id || null,
        });
    },

    async update(id, { nom_categorie, description, image_url, parent_id }) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new AppError("Catégorie non trouvée.", 404);
        }

        await categoryRepository.updateInstance(category, {
            nom_categorie,
            description,
            image_url: image_url !== undefined ? image_url : category.image_url,
            parent_id: parent_id !== undefined ? parent_id : category.parent_id,
        });

        return category;
    },

    async delete(id, req) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new AppError("Catégorie non trouvée.", 404);
        }

        await recordDeletion('Category', category, { req });
        await categoryRepository.destroy(category);

        return { message: "Catégorie supprimée avec succès." };
    },
};

module.exports = categoryService;
