const catchAsync = require('../../utils/catchAsync');
const disputeService = require('../service/dispute.service');

const disputeController = {
    createDispute: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const full = await disputeService.createDispute(req.body, req.user, io);
        res.status(201).json(full);
    }),

    getMyDisputes: catchAsync(async (req, res) => {
        const litiges = await disputeService.getMyDisputes(req.user.id);
        res.json(litiges);
    }),

    getDisputeById: catchAsync(async (req, res) => {
        const litige = await disputeService.getDisputeById(req.params.id, req.user);
        res.json(litige);
    }),

    getAllDisputes: catchAsync(async (req, res) => {
        const litiges = await disputeService.getAllDisputes(req.query.statut);
        res.json(litiges);
    }),

    respondToDispute: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const litige = await disputeService.respondToDispute(req.params.id, req.body.message, req.user, io);
        res.json(litige);
    }),

    acceptProposal: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const litige = await disputeService.acceptProposal(req.params.id, req.user, io);
        res.json(litige);
    }),

    escalateDispute: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const litige = await disputeService.escalateDispute(req.params.id, req.body.motif, req.user, io);
        res.json(litige);
    }),

    updateDisputeStatus: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const litige = await disputeService.updateDisputeStatus(req.params.id, req.body.statut, req.user, io);
        res.json(litige);
    }),

    resolveDispute: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await disputeService.resolveDispute(req.params.id, req.body, req.user, io);
        res.json(result);
    }),

    archiveDispute: catchAsync(async (req, res) => {
        const litige = await disputeService.archiveDispute(req.params.id, req.user);
        res.json(litige);
    }),
};

module.exports = disputeController;
