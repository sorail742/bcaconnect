const catchAsync = require('../../utils/catchAsync');
const creditService = require('../service/credit.service');

const creditController = {
    simulateCredit: catchAsync(async (req, res) => {
        const result = creditService.simulateCredit(req.body);
        res.json(result);
    }),

    requestCredit: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await creditService.requestCredit(req.body, req.user, io);
        res.status(201).json(result);
    }),

    getMicroCreditConfig: catchAsync(async (req, res) => {
        const result = creditService.getMicroCreditConfig();
        res.json(result);
    }),

    requestMicroCredit: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await creditService.requestMicroCredit(req.body, req.user, io);
        if (result.outcome === 'rejected') {
            return res.status(400).json({ message: result.message });
        }
        res.status(201).json({
            message: result.message,
            credit: result.credit,
            auto_approved: result.auto_approved,
        });
    }),

    getUserScore: catchAsync(async (req, res) => {
        const result = await creditService.getUserScore(req.user.id);
        res.json(result);
    }),

    approveCredit: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await creditService.approveCredit(req.params.id, io, req.app);
        if (result.outcome === 'rejected') {
            return res.status(400).json({ message: result.message });
        }
        res.json({
            message: result.message,
            credit: result.credit,
            orderActivated: result.orderActivated,
        });
    }),

    payInstallment: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await creditService.payInstallment(req.params.id, req.user, io);
        if (result.outcome === 'rejected') {
            return res.status(result.status).json({ message: result.message });
        }
        res.json({ message: result.message, echeance: result.echeance });
    }),

    getPendingCredits: catchAsync(async (req, res) => {
        const credits = await creditService.getPendingCredits();
        res.json(credits);
    }),

    getCreditApplicantsMap: catchAsync(async (req, res) => {
        const result = await creditService.getCreditApplicantsMap();
        res.json(result);
    }),

    rejectCredit: catchAsync(async (req, res) => {
        const result = await creditService.rejectCredit(req.params.id, req.body.motif_refus);
        res.json(result);
    }),

    getMyCredits: catchAsync(async (req, res) => {
        const credits = await creditService.getMyCredits(req.user.id);
        res.json(credits);
    }),
};

module.exports = creditController;
