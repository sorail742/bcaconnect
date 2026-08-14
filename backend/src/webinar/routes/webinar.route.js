const express = require('express');
const router = express.Router();
const webinarController = require('../controller/webinar.controller');
const { authMiddleware, grantAccess } = require('../../middlewares/authMiddleware');

// Toutes les routes nécessitent d'être authentifié
router.use(authMiddleware);

// Routes publiques (tous les membres authentifiés)
router.get('/', webinarController.getAll);
router.get('/:id', webinarController.getById);

// Routes administratives (admin uniquement)
router.post('/', grantAccess('manage_content'), webinarController.create);
router.put('/:id', grantAccess('manage_content'), webinarController.update);
router.delete('/:id', grantAccess('manage_content'), webinarController.delete);

module.exports = router;
