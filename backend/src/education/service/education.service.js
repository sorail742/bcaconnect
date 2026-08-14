const { Op } = require('sequelize');
const AppError = require('../../utils/AppError');
const { recordDeletion } = require('../../deletion-log/service/deletionLog.service');
const educationRepository = require('../repository/education.repository');

const ROLE_AUDIENCE = {
    client: 'clients',
    fournisseur: 'fournisseurs',
    transporteur: 'transporteurs',
};

const audienceForRole = (role) => {
    if (!role || role === 'admin') return null;
    return ROLE_AUDIENCE[role] || 'tous';
};

const educationService = {
    async getAllResources(user) {
        const audience = audienceForRole(user?.role);
        const where = audience
            ? { audience_cible: { [Op.in]: ['tous', audience] } }
            : {};

        const resources = await educationRepository.findAllFiltered(where);

        // Progression de l'utilisateur connecté, fusionnée par ressource — permet
        // au frontend d'afficher directement les badges "vu" / "réussi" / "échoué"
        // sans requête séparée par carte.
        let progressByResource = {};
        if (user) {
            const progress = await educationRepository.findProgressForUserAndResources(user.id, resources.map((r) => r.id));
            progressByResource = Object.fromEntries(progress.map((p) => [p.resource_id, p]));
        }

        return resources.map((r) => {
            const plain = r.toJSON();
            plain.has_quiz = !!plain.quiz;
            plain.ma_progression = progressByResource[r.id] || null;
            return plain;
        });
    },

    /** Marque une ressource comme consultée par l'utilisateur connecté. */
    async markViewed(id, userId) {
        const resource = await educationRepository.findResourceById(id);
        if (!resource) throw new AppError('Ressource introuvable.', 404);

        const [progress] = await educationRepository.findOrCreateProgress(userId, resource.id, { statut: 'vu' });
        return progress;
    },

    /** Quiz d'une ressource pour un apprenant — sans les bonnes réponses. */
    async getQuizForLearner(resourceId) {
        const quiz = await educationRepository.findQuizByResource(resourceId);
        if (!quiz) throw new AppError('Aucun quiz pour cette ressource.', 404);

        const questions = (quiz.questions || []).map(({ question, options }) => ({ question, options }));
        return { id: quiz.id, passing_score: quiz.passing_score, questions };
    },

    /** Corrige les réponses soumises et met à jour la progression. */
    async submitQuiz(resourceId, reponses, userId) {
        const resource = await educationRepository.findResourceById(resourceId);
        if (!resource) throw new AppError('Ressource introuvable.', 404);

        const quiz = await educationRepository.findQuizByResource(resource.id);
        if (!quiz) throw new AppError('Aucun quiz pour cette ressource.', 404);

        const questions = quiz.questions || [];
        if (!Array.isArray(reponses) || reponses.length !== questions.length) {
            throw new AppError(`${questions.length} réponse(s) attendue(s).`, 400);
        }

        let correctCount = 0;
        const correction = questions.map((q, i) => {
            const isCorrect = reponses[i] === q.correct_index;
            if (isCorrect) correctCount += 1;
            return { question: q.question, correct_index: q.correct_index, votre_reponse: reponses[i], correct: isCorrect };
        });

        const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
        const passed = score >= (quiz.passing_score || 60);

        const [progress] = await educationRepository.findOrCreateProgress(userId, resource.id, { statut: 'vu' });
        progress.statut = passed ? 'quiz_reussi' : 'quiz_echoue';
        progress.quiz_score = score;
        progress.tentatives += 1;
        progress.completed_at = passed ? new Date() : progress.completed_at;
        await educationRepository.saveProgress(progress);

        return { score, passed, passing_score: quiz.passing_score, correction, progress };
    },

    /** Progression complète de l'utilisateur connecté (tableau de bord Academy). */
    async getMyProgress(userId) {
        return educationRepository.findAllProgressForUser(userId);
    },

    /** Quiz complet (avec bonnes réponses) — édition admin. */
    async getQuizForAdmin(resourceId) {
        const quiz = await educationRepository.findQuizByResource(resourceId);
        return quiz || null;
    },

    /** Crée ou remplace le quiz d'une ressource (Admin). */
    async upsertQuiz(resourceId, { questions, passing_score }) {
        const resource = await educationRepository.findResourceById(resourceId);
        if (!resource) throw new AppError('Ressource introuvable.', 404);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new AppError('Au moins une question est requise.', 400);
        }
        for (const q of questions) {
            if (!q.question?.trim() || !Array.isArray(q.options) || q.options.length < 2) {
                throw new AppError('Chaque question doit avoir un énoncé et au moins 2 options.', 400);
            }
            if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index >= q.options.length) {
                throw new AppError('correct_index invalide pour une question.', 400);
            }
        }

        const [quiz] = await educationRepository.findOrCreateQuiz(resource.id, { questions, passing_score: passing_score || 60 });
        quiz.questions = questions;
        quiz.passing_score = passing_score || 60;
        await educationRepository.saveQuiz(quiz);

        return quiz;
    },

    async getAllAdmin() {
        return educationRepository.findAllResources();
    },

    async create({ titre, description, type_contenu, url_contenu, audience_cible, tag }, io) {
        if (!titre?.trim() || !description?.trim() || !url_contenu?.trim()) {
            throw new AppError('titre, description et url_contenu sont requis.', 400);
        }

        const resource = await educationRepository.createResource({
            titre: titre.trim(),
            description: description.trim(),
            type_contenu: type_contenu || 'article',
            url_contenu: url_contenu.trim(),
            audience_cible: audience_cible || 'tous',
            tag: tag?.trim() || null,
        });

        try {
            if (io) {
                io.emit('new_post', {
                    id: resource.id,
                    type: 'education',
                    titre: resource.titre,
                    message: `Nouveau contenu BCA Academy: ${resource.titre}`
                });
            }
        } catch (e) {
            console.warn('[EDUCATION] Erreur socket emit:', e.message);
        }

        return resource;
    },

    async update(id, { titre, description, type_contenu, url_contenu, audience_cible, tag }) {
        const resource = await educationRepository.findResourceById(id);
        if (!resource) throw new AppError('Ressource introuvable.', 404);

        await educationRepository.updateResourceInstance(resource, {
            titre: titre?.trim() ?? resource.titre,
            description: description?.trim() ?? resource.description,
            type_contenu: type_contenu ?? resource.type_contenu,
            url_contenu: url_contenu?.trim() ?? resource.url_contenu,
            audience_cible: audience_cible ?? resource.audience_cible,
            tag: tag !== undefined ? (tag?.trim() || null) : resource.tag,
        });

        return resource;
    },

    async delete(id, req) {
        const resource = await educationRepository.findResourceById(id);
        if (!resource) throw new AppError('Ressource introuvable.', 404);

        await recordDeletion('EducationalResource', resource, { req });
        await educationRepository.destroyResource(resource);
    },
};

module.exports = educationService;
