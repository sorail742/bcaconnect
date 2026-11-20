const catchAsync = require('../../utils/catchAsync');
const savService = require('../service/sav.service');

const savController = {
    getMyGuarantees: catchAsync(async (req, res) => {
        const guarantees = await savService.getMyGuarantees(req.user.id);
        res.json(guarantees);
    }),

    requestIntervention: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const intervention = await savService.requestIntervention(req.body, req.user, req.files, io);
        res.status(201).json({ message: 'Demande d\'intervention créée avec succès', intervention });
    }),

    getMyInterventions: catchAsync(async (req, res) => {
        const interventions = await savService.getMyInterventions(req.user.id);
        res.json(interventions);
    }),

    // ─── Admin : Liste toutes les interventions ─────────────────────────────────
    getAllInterventions: catchAsync(async (req, res) => {
        const interventions = await savService.getAllInterventions();
        res.json(interventions);
    }),

    // ─── Admin : Modifier le statut d'une intervention ───────────────────────────
    updateInterventionStatus: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const intervention = await savService.updateInterventionStatus(req.params.id, req.body, io);
        res.json({ message: 'Intervention mise à jour.', intervention });
    }),
};

module.exports = savController;
