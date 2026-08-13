const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const organizationController = require('../controller/organization.controller');

router.use(authMiddleware);

router.post('/', [body('nom').trim().isLength({ min: 2, max: 150 }), validateRequest], organizationController.create);
router.get('/mine', organizationController.getMine);

const idParam = [param('id').isUUID(), validateRequest];

router.put('/:id/threshold', idParam, organizationController.updateThreshold);
// role_membre (pas "role") : le middleware globalValidation.js valide TOUT
// champ nommé "role" contre l'enum des rôles UTILISATEUR (client/fournisseur/...),
// sans rapport avec les rôles d'appartenance à une organisation.
router.post('/:id/members', [...idParam, body('email').isEmail(), body('role_membre').isIn(['acheteur', 'valideur', 'admin'])], organizationController.inviteMember);
router.get('/:id/members', idParam, organizationController.listMembers);
router.delete('/:id/members/:memberId', [...idParam, param('memberId').isUUID(), validateRequest], organizationController.removeMember);

router.post('/:id/order-requests', [...idParam, body('items').isArray({ min: 1 })], organizationController.submitOrderRequest);
router.get('/:id/order-requests/pending', idParam, organizationController.listPendingRequests);
router.put('/order-requests/:requestId/approve', [param('requestId').isUUID(), validateRequest], organizationController.approveRequest);
router.put('/order-requests/:requestId/reject', [param('requestId').isUUID(), validateRequest], organizationController.rejectRequest);

module.exports = router;
