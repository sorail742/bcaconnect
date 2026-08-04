const catchAsync = require('../../utils/catchAsync');
const productQuestionService = require('../service/productQuestion.service');

const productQuestionController = {
    // Liste publique des questions visibles pour un produit
    getForProduct: catchAsync(async (req, res) => {
        const questions = await productQuestionService.getForProduct(req.params.productId);
        res.json(questions);
    }),

    // Poser une question (tout utilisateur connecté)
    ask: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const full = await productQuestionService.ask(req.params.productId, req.body.question, req.user, io);
        res.status(201).json({ message: 'Question publiée.', productQuestion: full });
    }),

    // Répondre (fournisseur propriétaire du produit, ou admin)
    answer: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const full = await productQuestionService.answer(req.params.id, req.body.reponse, req.user, io);
        res.json({ message: 'Réponse publiée.', productQuestion: full });
    }),

    // Marquer une question comme utile (compteur simple, sans anti-doublon strict)
    markHelpful: catchAsync(async (req, res) => {
        const result = await productQuestionService.markHelpful(req.params.id);
        res.json(result);
    }),

    // Supprimer (auteur de la question, fournisseur du produit, ou admin)
    remove: catchAsync(async (req, res) => {
        await productQuestionService.remove(req.params.id, req.user);
        res.json({ message: 'Question supprimée.' });
    }),

    // Questions en attente de réponse pour le fournisseur connecté (tableau de bord vendeur)
    getPendingForVendor: catchAsync(async (req, res) => {
        const questions = await productQuestionService.getPendingForVendor(req.user.id);
        res.json(questions);
    }),
};

module.exports = productQuestionController;
