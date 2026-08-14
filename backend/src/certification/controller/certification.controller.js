const catchAsync = require('../../utils/catchAsync');
const certificationService = require('../service/certification.service');

const certificationController = {
    // 1. Le fournisseur soumet une certification
    create: catchAsync(async (req, res) => {
        const certification = await certificationService.create(req.body, req.user.id);
        res.status(201).json(certification);
    }),

    // 2. Le fournisseur consulte ses propres certifications
    getMine: catchAsync(async (req, res) => {
        const certifications = await certificationService.getMine(req.user.id);
        res.json(certifications);
    }),

    // 3. Admin : liste de toutes les certifications (filtrable par statut)
    getAll: catchAsync(async (req, res) => {
        const certifications = await certificationService.getAll(req.query.statut);
        res.json(certifications);
    }),

    // 4. Admin : valide ou rejette une certification
    review: catchAsync(async (req, res) => {
        const certification = await certificationService.review(req.params.id, req.body);
        res.json(certification);
    }),

    // 5. Statut public de certification d'un fournisseur (badge boutique)
    getVendorStatus: catchAsync(async (req, res) => {
        const result = await certificationService.getVendorStatus(req.params.vendorId);
        res.json(result);
    }),
};

module.exports = certificationController;
