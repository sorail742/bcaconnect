const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const savController = require('../controllers/savController');

// Récupérer les garanties de l'utilisateur connecté
router.get('/guarantees', authMiddleware, savController.getMyGuarantees);

// Demander une intervention
router.post('/interventions', authMiddleware, savController.requestIntervention);

// Récupérer les interventions de l'utilisateur connecté
router.get('/interventions', authMiddleware, savController.getMyInterventions);

module.exports = router;
