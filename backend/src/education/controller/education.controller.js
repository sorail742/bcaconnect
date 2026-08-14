const catchAsync = require('../../utils/catchAsync');
const educationService = require('../service/education.service');

const educationController = {
    getAllResources: catchAsync(async (req, res) => {
        const resources = await educationService.getAllResources(req.user);
        res.json(resources);
    }),

    /** Marque une ressource comme consultée par l'utilisateur connecté. */
    markViewed: catchAsync(async (req, res) => {
        const progress = await educationService.markViewed(req.params.id, req.user.id);
        res.json(progress);
    }),

    /** Quiz d'une ressource pour un apprenant — sans les bonnes réponses. */
    getQuizForLearner: catchAsync(async (req, res) => {
        const result = await educationService.getQuizForLearner(req.params.id);
        res.json(result);
    }),

    /** Corrige les réponses soumises et met à jour la progression. */
    submitQuiz: catchAsync(async (req, res) => {
        const result = await educationService.submitQuiz(req.params.id, req.body.reponses, req.user.id);
        res.json(result);
    }),

    /** Progression complète de l'utilisateur connecté (tableau de bord Academy). */
    getMyProgress: catchAsync(async (req, res) => {
        const progress = await educationService.getMyProgress(req.user.id);
        res.json(progress);
    }),

    /** Quiz complet (avec bonnes réponses) — édition admin. */
    getQuizForAdmin: catchAsync(async (req, res) => {
        const quiz = await educationService.getQuizForAdmin(req.params.id);
        res.json(quiz);
    }),

    /** Crée ou remplace le quiz d'une ressource (Admin). */
    upsertQuiz: catchAsync(async (req, res) => {
        const quiz = await educationService.upsertQuiz(req.params.id, req.body);
        res.json(quiz);
    }),

    getAllAdmin: catchAsync(async (req, res) => {
        const resources = await educationService.getAllAdmin();
        res.json(resources);
    }),

    create: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const resource = await educationService.create(req.body, io);
        res.status(201).json(resource);
    }),

    update: catchAsync(async (req, res) => {
        const resource = await educationService.update(req.params.id, req.body);
        res.json(resource);
    }),

    delete: catchAsync(async (req, res) => {
        await educationService.delete(req.params.id, req);
        res.json({ message: 'Ressource supprimée.' });
    }),
};

module.exports = educationController;
