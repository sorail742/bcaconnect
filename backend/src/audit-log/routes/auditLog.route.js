const express = require('express');
const router = express.Router();
const auditLogController = require('../controller/auditLog.controller');
const { authMiddleware, grantAccess } = require('../../middlewares/authMiddleware');

// Journal d'activité — toutes les actions des utilisateurs (IP, action, ressource...).
// Lecture réservée à l'admin.
router.use(authMiddleware, grantAccess('view_audit_logs'));

router.get('/', auditLogController.getAll);
router.get('/user/:userId/summary', auditLogController.getUserActivitySummary);
router.get('/:id', auditLogController.getById);

module.exports = router;
