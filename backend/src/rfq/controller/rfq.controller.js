const catchAsync = require('../../utils/catchAsync');
const rfqService = require('../service/rfq.service');

const rfqController = {
    // Créer une demande de devis (acheteur : client ou fournisseur qui achète)
    create: catchAsync(async (req, res) => {
        const demande = await rfqService.create(req.body, req.user.id);
        res.status(201).json({ message: 'Demande de devis publiée.', demande });
    }),

    // Marketplace des demandes ouvertes (vue fournisseur)
    getOpen: catchAsync(async (req, res) => {
        const demandes = await rfqService.getOpen(req.query.categorie_id);
        res.json(demandes);
    }),

    // Mes propres demandes (vue acheteur), avec tous les devis reçus
    getMine: catchAsync(async (req, res) => {
        const demandes = await rfqService.getMine(req.user.id);
        res.json(demandes);
    }),

    // Mes devis soumis (vue fournisseur)
    getMyQuotes: catchAsync(async (req, res) => {
        const devis = await rfqService.getMyQuotes(req.user.id);
        res.json(devis);
    }),

    // Détail d'une demande — les devis ne sont visibles en entier que par l'acheteur ;
    // un fournisseur non-propriétaire ne voit que son propre devis (négociation à l'aveugle).
    getById: catchAsync(async (req, res) => {
        const demande = await rfqService.getById(req.params.id, req.user);
        res.json(demande);
    }),

    // Soumettre (ou mettre à jour) un devis — un fournisseur = un devis par demande
    submitQuote: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const quote = await rfqService.submitQuote(req.params.id, req.body, req.user, io);
        res.status(201).json({ message: 'Devis soumis avec succès.', quote });
    }),

    // L'acheteur accepte un devis
    acceptQuote: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const { demande, conversation_id } = await rfqService.acceptQuote(req.params.id, req.params.quoteId, req.user, io);
        res.json({ message: 'Devis accepté. Une conversation a été ouverte pour finaliser la commande.', demande, conversation_id });
    }),

    // ── Appel d'offres projet multi-lignes (analyse concurrentielle #10) ──
    createProject: catchAsync(async (req, res) => {
        const demande = await rfqService.createProject(req.body, req.user.id);
        res.status(201).json({ message: "Appel d'offres publié.", demande });
    }),

    submitProjectQuote: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const quote = await rfqService.submitProjectQuote(req.params.id, req.body, req.user, io);
        res.status(201).json({ message: 'Offre soumise avec succès.', quote });
    }),

    getProjectComparison: catchAsync(async (req, res) => {
        const result = await rfqService.getProjectComparison(req.params.id, req.user);
        res.json(result);
    }),

    // Fermer une demande sans accepter de devis
    close: catchAsync(async (req, res) => {
        const demande = await rfqService.close(req.params.id, req.user);
        res.json({ message: 'Demande fermée.', demande });
    }),
};

module.exports = rfqController;
