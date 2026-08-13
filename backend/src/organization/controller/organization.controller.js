const catchAsync = require('../../utils/catchAsync');
const organizationService = require('../service/organization.service');
const organizationOrderRequestService = require('../service/organizationOrderRequest.service');

const organizationController = {
    create: catchAsync(async (req, res) => {
        const org = await organizationService.create(req.body, req.user);
        res.status(201).json(org);
    }),

    getMine: catchAsync(async (req, res) => {
        const result = await organizationService.getMine(req.user.id);
        res.json(result);
    }),

    updateThreshold: catchAsync(async (req, res) => {
        const org = await organizationService.updateThreshold(req.params.id, req.body.plafond_approbation_auto, req.user);
        res.json(org);
    }),

    inviteMember: catchAsync(async (req, res) => {
        const member = await organizationService.inviteMember(req.params.id, req.body, req.user);
        res.status(201).json(member);
    }),

    listMembers: catchAsync(async (req, res) => {
        const members = await organizationService.listMembers(req.params.id, req.user);
        res.json(members);
    }),

    removeMember: catchAsync(async (req, res) => {
        const result = await organizationService.removeMember(req.params.id, req.params.memberId, req.user);
        res.json(result);
    }),

    submitOrderRequest: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await organizationOrderRequestService.submitOrderRequest(req.params.id, req.body, req.user, io);
        res.status(201).json(result);
    }),

    listPendingRequests: catchAsync(async (req, res) => {
        const requests = await organizationOrderRequestService.listPending(req.params.id, req.user);
        res.json(requests);
    }),

    approveRequest: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const request = await organizationOrderRequestService.approve(req.params.requestId, req.user, io);
        res.json(request);
    }),

    rejectRequest: catchAsync(async (req, res) => {
        const request = await organizationOrderRequestService.reject(req.params.requestId, req.body.commentaire, req.user);
        res.json(request);
    }),
};

module.exports = organizationController;
