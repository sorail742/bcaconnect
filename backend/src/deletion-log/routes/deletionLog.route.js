const express = require('express');
const router = express.Router();
const deletionLogController = require('../controller/deletionLog.controller');
const { authMiddleware, grantAccess } = require('../../middlewares/authMiddleware');

// Historique infini des suppressions — lecture/restauration réservées à l'admin.
router.use(authMiddleware, grantAccess('view_deletion_history'));

router.get('/', deletionLogController.getAll);
router.get('/:id', deletionLogController.getById);
router.post('/:id/restore', deletionLogController.restore);

module.exports = router;
