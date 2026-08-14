const { Op } = require('sequelize');
const EducationalResource = require('../models/educationalResource.model');
const EducationalQuiz = require('../models/educationalQuiz.model');
const EducationalProgress = require('../models/educationalProgress.model');

const educationRepository = {
    findAllFiltered(where) {
        return EducationalResource.findAll({
            where,
            include: [{ model: EducationalQuiz, as: 'quiz', attributes: ['id', 'passing_score'] }],
            order: [['created_at', 'DESC']],
        });
    },

    findProgressForUserAndResources(userId, resourceIds) {
        return EducationalProgress.findAll({
            where: { utilisateur_id: userId, resource_id: { [Op.in]: resourceIds } },
        });
    },

    findResourceById(id) {
        return EducationalResource.findByPk(id);
    },

    findOrCreateProgress(userId, resourceId, defaults) {
        return EducationalProgress.findOrCreate({
            where: { utilisateur_id: userId, resource_id: resourceId },
            defaults,
        });
    },

    saveProgress(progress) {
        return progress.save();
    },

    findQuizByResource(resourceId) {
        return EducationalQuiz.findOne({ where: { resource_id: resourceId } });
    },

    findAllProgressForUser(userId) {
        return EducationalProgress.findAll({
            where: { utilisateur_id: userId },
            include: [{ model: EducationalResource, as: 'ressource', attributes: ['id', 'titre', 'type_contenu', 'tag'] }],
            order: [['updated_at', 'DESC']],
        });
    },

    findOrCreateQuiz(resourceId, defaults) {
        return EducationalQuiz.findOrCreate({ where: { resource_id: resourceId }, defaults });
    },

    saveQuiz(quiz) {
        return quiz.save();
    },

    findAllResources() {
        return EducationalResource.findAll({ order: [['created_at', 'DESC']] });
    },

    createResource(data) {
        return EducationalResource.create(data);
    },

    updateResourceInstance(resource, data) {
        return resource.update(data);
    },

    destroyResource(resource) {
        return resource.destroy();
    },
};

module.exports = educationRepository;
